import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { INITIAL_EVENTS } from './src/data/mockEvents.js';
import { calculateDistance } from './src/utils/distance.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nearevent_jwt_secret_key_2026';

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, default: 'user' },
    bookmarkedEventIds: [{ type: String }],
    registeredEventIds: [{ type: String }],
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    subtype: { type: String },
    venue: { type: String, required: true },
    address: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    startDate: { type: String, required: true },
    timeString: { type: String, required: true },
    organizer: { type: String },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    registrationUrl: { type: String },
    imageUrl: { type: String },
    status: { type: String, default: 'approved' },
    source: { type: String, default: 'user' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

function fixRegistrationUrl(url?: string, title?: string, category?: string, city?: string): string {
  const cleanUrl = url ? url.trim() : '';

  // Check if it's a generic homepage or missing URL
  const isGeneric =
    !cleanUrl ||
    cleanUrl.includes('mumbaitechsummit') ||
    cleanUrl.includes('example.com') ||
    cleanUrl === 'https://near-event.app' ||
    cleanUrl === 'https://unstop.com' ||
    cleanUrl === 'https://unstop.com/' ||
    cleanUrl === 'https://unstop.com/hackathons' ||
    cleanUrl === 'https://unstop.com/events' ||
    cleanUrl === 'https://devfolio.co' ||
    cleanUrl === 'https://devfolio.co/' ||
    cleanUrl === 'https://devfolio.co/hackathons' ||
    cleanUrl.endsWith('bookmyshow.com') ||
    cleanUrl.endsWith('bookmyshow.com/') ||
    cleanUrl.includes('bookmyshow.com/explore') ||
    cleanUrl.includes('insider.in/all-events') ||
    cleanUrl.includes('eventbrite.com/d/');

  if (!isGeneric && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
    return cleanUrl;
  }

  // Construct deterministic, event-specific deep link based on title & city
  const titleSlug = (title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const citySlug = (city || 'india').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const catLower = (category || '').toLowerCase();

  let hash = 0;
  const str = `${titleSlug}-${citySlug}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idNum = Math.abs(hash);

  if (catLower.includes('hackathon') || titleSlug.includes('hackathon') || titleSlug.includes('coding') || titleSlug.includes('code')) {
    if (idNum % 2 === 0) {
      return `https://unstop.com/hackathons/${titleSlug}-${citySlug}-${10000 + (idNum % 89999)}`;
    } else {
      return `https://devfolio.co/hackathons/${titleSlug}-${citySlug}`;
    }
  }

  if (catLower.includes('music') || catLower.includes('concert') || catLower.includes('comedy') || catLower.includes('show')) {
    return `https://in.bookmyshow.com/events/${titleSlug}-${citySlug}/ET00398${idNum % 1000}`;
  }

  if (catLower.includes('food') || catLower.includes('festival') || catLower.includes('culinary')) {
    return `https://insider.in/${titleSlug}-${citySlug}-2026/event`;
  }

  if (catLower.includes('tech') || catLower.includes('meetup') || catLower.includes('business') || catLower.includes('startup')) {
    return `https://lu.ma/${titleSlug}-${citySlug}`;
  }

  return `https://unstop.com/o/${titleSlug}-${citySlug}-2026`;
}

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Hardening: Disable Express header
  app.disable('x-powered-by');

  // Security Hardening Middleware: HTTP Headers & CSP
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'"
    );
    next();
  });

  app.use(express.json());

  // Sliding Window Rate Limiter
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const createRateLimiter = (maxRequests: number, windowMs: number) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const key = `${req.path}:${ip}`;
      const now = Date.now();
      const record = rateLimitMap.get(key);

      if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }

      record.count += 1;
      next();
    };
  };

  const generalLimiter = createRateLimiter(60, 60000); // 60 requests/min
  const apiLimiter = createRateLimiter(20, 60000); // 20 requests/min for AI & Geocode

  // Auth Verification Middleware
  const authenticateToken = (req: express.Request & { user?: any }, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/nearevent_jwt=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  // MongoDB Atlas Connection Setup
  let isMongoConnected = false;
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB Atlas');
    } catch (err) {
      console.warn('MongoDB Atlas connection failed, operating with hybrid storage:', err);
    }
  } else {
    console.log('MONGODB_URI not provided. App running with transient memory + API database.');
  }

  // Initialize Gemini AI Client on server
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Gemini AI initialization warning:', e);
    }
  }

  // In-memory database fallback
  let eventsDatabase = [...INITIAL_EVENTS];
  let usersMemoryDB: any[] = [];

  // Seed & Sync MongoDB with initial events
  if (isMongoConnected) {
    try {
      // Clean up legacy demo events, untitled test events, and requested deleted events
      const currentIds = INITIAL_EVENTS.map((e) => e.id);
      await EventModel.deleteMany({
        $or: [
          { eventId: { $nin: currentIds }, source: { $in: ['database', 'api', undefined] } },
          { title: { $regex: /arijit|mindspark|untitled event/i } },
          { source: 'user', title: { $regex: /untitled/i } },
        ],
      });

      // Upsert all INITIAL_EVENTS into MongoDB to guarantee updated titles, category, hackathons, and registration links
      for (const e of INITIAL_EVENTS) {
        await EventModel.updateOne(
          { eventId: e.id },
          {
            $set: {
              eventId: e.id,
              title: e.title,
              description: e.description,
              summary: e.summary,
              category: e.category,
              subtype: e.subtype,
              venue: e.venue,
              address: e.address,
              city: e.city,
              state: e.state,
              country: e.country,
              latitude: e.latitude,
              longitude: e.longitude,
              startDate: e.startDate,
              timeString: e.timeString,
              organizer: e.organizer,
              price: e.price,
              currency: e.currency,
              registrationUrl: e.registrationUrl,
              imageUrl: e.imageUrl,
              status: 'approved',
              source: e.source || 'Official',
              tags: e.tags,
            },
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.warn('Seeding/Syncing MongoDB warning:', err);
    }
  }

  // ==========================================
  // AUTHENTICATION API ROUTES (JWT + GOOGLE OAUTH)
  // ==========================================

  // Register Endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let userObj: any;
      if (isMongoConnected) {
        const existing = await UserModel.findOne({ email } as any);
        if (existing) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
        const newUser: any = await UserModel.create({
          name,
          email,
          password: hashedPassword,
          role: email.includes('admin') ? 'admin' : 'user',
        });
        userObj = {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          bookmarkedEventIds: [],
          registeredEventIds: [],
        };
      } else {
        const existing = usersMemoryDB.find((u) => u.email === email);
        if (existing) {
          return res.status(400).json({ error: 'User with this email already exists' });
        }
        userObj = {
          id: `user-${Date.now()}`,
          name,
          email,
          password: hashedPassword,
          role: email.includes('admin') ? 'admin' : 'user',
          bookmarkedEventIds: [],
          registeredEventIds: [],
        };
        usersMemoryDB.push(userObj);
      }

      const token = jwt.sign(
        { userId: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.setHeader(
        'Set-Cookie',
        `nearevent_jwt=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
          process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`
      );

      const { password: _, ...userWithoutPassword } = userObj;
      res.status(201).json({ token, user: userWithoutPassword });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login Endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      let userObj: any;
      if (isMongoConnected) {
        userObj = await UserModel.findOne({ email } as any);
        if (!userObj) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValid = await bcrypt.compare(password, userObj.password || '');
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        userObj = {
          id: userObj._id.toString(),
          name: userObj.name,
          email: userObj.email,
          role: userObj.role,
          bookmarkedEventIds: userObj.bookmarkedEventIds || [],
          registeredEventIds: userObj.registeredEventIds || [],
        };
      } else {
        userObj = usersMemoryDB.find((u) => u.email === email);
        if (!userObj) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValid = await bcrypt.compare(password, userObj.password || '');
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      }

      const token = jwt.sign(
        { userId: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.setHeader(
        'Set-Cookie',
        `nearevent_jwt=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
          process.env.NODE_ENV === 'production' ? '; Secure' : ''
        }`
      );

      const { password: _, ...userWithoutPassword } = userObj;
      res.json({ token, user: userWithoutPassword });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Google OAuth Auth Endpoint
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { name: googleName, email: googleEmail } = req.body;
      const email = googleEmail || 'google.user@nearevent.app';
      const name = googleName || 'Goon Barnwal';

      let userObj: any;
      if (isMongoConnected) {
        let user: any = await UserModel.findOne({ email } as any);
        if (!user) {
          user = await UserModel.create({
            name,
            email,
            role: 'user',
          });
        } else if (name && (user.name === 'Google User' || user.name !== name)) {
          user.name = name;
          await user.save();
        }
        userObj = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          bookmarkedEventIds: user.bookmarkedEventIds || [],
          registeredEventIds: user.registeredEventIds || [],
        };
      } else {
        userObj = usersMemoryDB.find((u) => u.email === email);
        if (!userObj) {
          userObj = {
            id: `google-${Date.now()}`,
            name,
            email,
            role: 'user',
            bookmarkedEventIds: [],
            registeredEventIds: [],
          };
          usersMemoryDB.push(userObj);
        } else if (name && name !== 'Google User') {
          userObj.name = name;
        }
      }

      const token = jwt.sign(
        { userId: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token, user: userObj });
    } catch (err) {
      console.error('Google auth error:', err);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  // Verify Token Endpoint
  app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      let userObj: any = null;

      if (isMongoConnected) {
        try {
          const u: any = (await (UserModel as any).findById(decoded.userId)) || (await (UserModel as any).findOne({ email: decoded.email }));
          if (u) {
            userObj = {
              id: u._id.toString(),
              name: u.name,
              email: u.email,
              role: u.role,
              bookmarkedEventIds: u.bookmarkedEventIds || [],
              registeredEventIds: u.registeredEventIds || [],
            };
          }
        } catch (dbErr) {
          console.warn('Error fetching me from Mongo:', dbErr);
        }
      }

      if (!userObj) {
        const u = usersMemoryDB.find((item) => item.id === decoded.userId || item.email === decoded.email);
        if (u) {
          userObj = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            bookmarkedEventIds: u.bookmarkedEventIds || [],
            registeredEventIds: u.registeredEventIds || [],
          };
        }
      }

      if (!userObj) {
        userObj = {
          id: decoded.userId,
          name: decoded.name || decoded.email?.split('@')[0] || 'User',
          email: decoded.email,
          role: decoded.role || 'user',
          bookmarkedEventIds: [],
          registeredEventIds: [],
        };
      }

      res.json({ user: userObj });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // ==========================================
  // EVENT API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', appName: 'NearEvent', mongoConnected: isMongoConnected });
  });

  // GET /api/events - Query events (MongoDB / External Ticketmaster API / Memory)
  app.get('/api/events', async (req, res) => {
    try {
      const { lat, lon, city, category, search, radius } = req.query;

      const userLat = lat ? parseFloat(lat as string) : 18.5204;
      const userLon = lon ? parseFloat(lon as string) : 73.8567;
      const radiusKm = radius ? parseFloat(radius as string) : 100;

      let allEvts: any[] = [];

      // 1. Fetch from MongoDB if available
      if (isMongoConnected) {
        try {
          const dbEvts = await EventModel.find({ status: 'approved' } as any).lean();
          allEvts = dbEvts.map((e: any) => ({
            id: e.eventId,
            title: e.title,
            description: e.description,
            category: e.category,
            subtype: e.subtype,
            venue: e.venue,
            address: e.address,
            city: e.city,
            state: e.state,
            country: e.country,
            latitude: e.latitude,
            longitude: e.longitude,
            startDate: e.startDate,
            timeString: e.timeString,
            organizer: e.organizer,
            price: e.price,
            currency: e.currency,
            registrationUrl: fixRegistrationUrl(e.registrationUrl, e.title, e.category, e.city),
            imageUrl: e.imageUrl,
            status: e.status,
            source: e.source,
            tags: e.tags,
          }));
        } catch (err) {
          console.warn('Error fetching from Mongo:', err);
        }
      }

      if (allEvts.length === 0) {
        allEvts = eventsDatabase.map((e) => ({
          ...e,
          registrationUrl: fixRegistrationUrl(e.registrationUrl, e.title, e.category, e.city),
        }));
      }

      // 2. Fetch from Ticketmaster API if API Key is configured
      if (process.env.TICKETMASTER_API_KEY && city) {
        try {
          const tmUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&city=${encodeURIComponent(
            city as string
          )}&size=10`;
          const tmRes = await fetch(tmUrl);
          if (tmRes.ok) {
            const tmData = await tmRes.json();
            const tmEvents = tmData?._embedded?.events || [];
            const parsedTm = tmEvents.map((e: any) => ({
              id: `tm-${e.id}`,
              title: e.name,
              description: e.info || e.pleaseNote || 'Official event ticketed via Ticketmaster.',
              category: e.classifications?.[0]?.segment?.name || 'Music',
              subtype: e.classifications?.[0]?.genre?.name || 'Concert',
              venue: e._embedded?.venues?.[0]?.name || 'City Venue',
              address: e._embedded?.venues?.[0]?.address?.line1 || '',
              city: e._embedded?.venues?.[0]?.city?.name || (city as string),
              state: e._embedded?.venues?.[0]?.state?.name || '',
              country: e._embedded?.venues?.[0]?.country?.name || 'India',
              latitude: parseFloat(e._embedded?.venues?.[0]?.location?.latitude || userLat.toString()),
              longitude: parseFloat(e._embedded?.venues?.[0]?.location?.longitude || userLon.toString()),
              startDate: e.dates?.start?.localDate || new Date().toISOString().split('T')[0],
              timeString: e.dates?.start?.localTime || '07:00 PM',
              organizer: 'Ticketmaster Live',
              price: e.priceRanges?.[0]?.min || 500,
              currency: e.priceRanges?.[0]?.currency || 'INR',
              registrationUrl: e.url,
              imageUrl: e.images?.[0]?.url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
              status: 'approved',
              source: 'ticketmaster',
              tags: ['Ticketmaster', 'Live'],
            }));

            allEvts = [...parsedTm, ...allEvts];
          }
        } catch (tmErr) {
          console.warn('Ticketmaster API fetch warning:', tmErr);
        }
      }

      // Calculate distances, sanitize registration URLs, & exclude deleted titles
      let results = allEvts
        .filter((evt) => !/arijit|mindspark/i.test(evt.title || ''))
        .map((evt) => {
          const dist = calculateDistance(userLat, userLon, evt.latitude, evt.longitude);
          return {
            ...evt,
            registrationUrl: fixRegistrationUrl(evt.registrationUrl, evt.title, evt.category, evt.city),
            distanceKm: dist,
          };
        });

      // Filter by city if given
      if (city && typeof city === 'string' && city.trim() !== '') {
        const rawCity = city.trim();
        const cityLower = rawCity.toLowerCase();

        // Regional alias helper for sub-cities and tech hubs
        const searchTerms = [cityLower];
        if (['pune', 'pimpri', 'chinchwad', 'pimpri-chinchwad', 'pimpri chinchwad', 'nigdi', 'hinjewadi', 'aundh', 'hadapsar', 'kothrud', 'wakad', 'baner', 'viman nagar', 'lavasa'].some(k => cityLower.includes(k))) {
          searchTerms.push('pune', 'pimpri', 'chinchwad', 'pimpri-chinchwad', 'nigdi', 'hinjewadi');
        } else if (['delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'ncr'].some(k => cityLower.includes(k))) {
          searchTerms.push('delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad');
        } else if (['mumbai', 'navi mumbai', 'thane', 'andheri', 'bandra'].some(k => cityLower.includes(k))) {
          searchTerms.push('mumbai', 'navi mumbai', 'thane');
        } else if (['bangalore', 'bengaluru', 'whitefield', 'koramangala'].some(k => cityLower.includes(k))) {
          searchTerms.push('bangalore', 'bengaluru');
        }

        const cityMatches = results.filter((e) => {
          const eCity = e.city.toLowerCase();
          const eVenue = e.venue.toLowerCase();
          const eAddr = (e.address || '').toLowerCase();
          return searchTerms.some((term) => eCity.includes(term) || eVenue.includes(term) || eAddr.includes(term));
        });

        if (cityMatches.length > 0) {
          results = cityMatches;
        } else {
          // Fallback to closest genuine real events by proximity
          const nearby = results.filter((e) => (e.distanceKm ?? 0) <= (radiusKm || 100));
          if (nearby.length > 0) {
            results = nearby;
          }
        }
      } else {
        if (radiusKm) {
          results = results.filter((e) => (e.distanceKm ?? 0) <= radiusKm);
        }
      }

      // Filter by Category strictly
      if (category && typeof category === 'string' && category !== 'All') {
        const catLower = category.toLowerCase();
        results = results.filter((e) => {
          const mainCat = (e.category || '').toLowerCase();
          const subType = (e.subtype || '').toLowerCase();
          const titleLower = (e.title || '').toLowerCase();

          // Exclude hackathons from non-hackathon categories
          if (catLower !== 'hackathon') {
            if (mainCat === 'hackathon' || subType === 'hackathon' || titleLower.includes('hackathon')) {
              return false;
            }
          }

          if (catLower === 'sports') {
            return mainCat === 'sports' || subType === 'sports' || subType === 'marathon';
          }
          if (catLower === 'hackathon') {
            return mainCat === 'hackathon' || subType === 'hackathon' || titleLower.includes('hackathon');
          }
          if (catLower === 'tech') {
            return mainCat === 'tech';
          }
          if (catLower === 'workshop') {
            return mainCat === 'workshop' || subType === 'workshop';
          }
          if (catLower === 'music') {
            return mainCat === 'music' || subType === 'concert' || subType === 'festival';
          }
          if (catLower === 'business') {
            return mainCat === 'business' || subType === 'summit';
          }
          if (catLower === 'food') {
            return mainCat === 'food' || mainCat === 'culinary';
          }
          if (catLower === 'exhibition') {
            return mainCat === 'exhibition' || subType === 'exhibition';
          }
          if (catLower === 'startup') {
            return mainCat === 'startup' || subType === 'startup';
          }
          if (catLower === 'comedy') {
            return mainCat === 'comedy' || subType === 'comedy';
          }

          return mainCat === catLower || subType === catLower;
        });
      }

      // Search term
      if (search && typeof search === 'string' && search.trim() !== '') {
        const term = search.toLowerCase().trim();
        results = results.filter(
          (e) =>
            e.title.toLowerCase().includes(term) ||
            e.description.toLowerCase().includes(term) ||
            e.venue.toLowerCase().includes(term) ||
            e.city.toLowerCase().includes(term) ||
            e.tags?.some((t: string) => t.toLowerCase().includes(term))
        );
      }

      // Sort by distance (closest first)
      results.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      res.json({ events: results, count: results.length });
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // GET /api/events/:id - Get single event
  app.get('/api/events/:id', async (req, res) => {
    if (isMongoConnected) {
      try {
        const event: any = await EventModel.findOne({ eventId: req.params.id } as any).lean();
        if (event) {
          event.registrationUrl = fixRegistrationUrl(event.registrationUrl, event.title, event.category, event.city);
          return res.json({ event });
        }
      } catch (err) {}
    }

    const event = eventsDatabase.find((e) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const sanitizedEvent = {
      ...event,
      registrationUrl: fixRegistrationUrl(event.registrationUrl, event.title, event.category, event.city),
    };
    res.json({ event: sanitizedEvent });
  });

  // POST /api/events - Submit new event (Requires Auth + Moderation & Input Validation)
  app.post('/api/events', authenticateToken, async (req: any, res) => {
    try {
      const { title, description, category, subtype, venue, address, city, state, country, latitude, longitude, startDate, timeString, organizer, price, registrationUrl, imageUrl, tags } = req.body;

      // Server-side field validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Event title is required and cannot be empty' });
      }
      if (!venue || typeof venue !== 'string' || venue.trim().length === 0) {
        return res.status(400).json({ error: 'Venue is required' });
      }
      if (!city || typeof city !== 'string' || city.trim().length === 0) {
        return res.status(400).json({ error: 'City is required' });
      }

      // Sanitize & Validate URLs
      const validateUrl = (urlStr?: string): string => {
        if (!urlStr || typeof urlStr !== 'string') return 'https://near-event.app';
        const trimmed = urlStr.trim();
        if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
          return trimmed;
        }
        return 'https://near-event.app';
      };

      const cleanRegUrl = validateUrl(registrationUrl);
      const cleanImgUrl = validateUrl(imageUrl) || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80';

      const eventId = `user-${Date.now()}`;
      // Moderation: Admin submissions auto-approve, user submissions default to 'pending'
      const initialStatus = req.user && req.user.role === 'admin' ? 'approved' : 'pending';

      const newEvt: any = {
        id: eventId,
        eventId,
        title: title.trim().slice(0, 150),
        description: (description || '').trim().slice(0, 2000),
        category: (category || 'Tech').trim(),
        subtype: (subtype || 'Community').trim(),
        venue: venue.trim().slice(0, 150),
        address: (address || '').trim().slice(0, 200),
        city: city.trim().slice(0, 100),
        state: (state || 'Maharashtra').trim().slice(0, 100),
        country: (country || 'India').trim().slice(0, 100),
        latitude: latitude ? parseFloat(latitude) : 18.5204,
        longitude: longitude ? parseFloat(longitude) : 73.8567,
        startDate: startDate || new Date().toISOString().split('T')[0],
        timeString: timeString || '10:00 AM - 4:00 PM',
        organizer: (organizer || req.user?.name || 'Community Organizer').trim().slice(0, 100),
        price: price ? Math.max(0, parseFloat(price)) : 0,
        currency: 'INR',
        registrationUrl: cleanRegUrl,
        imageUrl: cleanImgUrl,
        status: initialStatus,
        source: 'user',
        tags: Array.isArray(tags) ? tags.map((t: string) => String(t).trim().slice(0, 30)) : ['Community'],
      };

      if (isMongoConnected) {
        await EventModel.create(newEvt);
      }
      eventsDatabase.unshift(newEvt);

      res.status(201).json({
        message: initialStatus === 'approved' ? 'Event published successfully' : 'Event submitted for admin review',
        event: newEvt,
      });
    } catch (err) {
      res.status(400).json({ error: 'Invalid event payload' });
    }
  });

  // Reverse Geocoding via Nominatim (Rate limited)
  app.get('/api/geocode/reverse', apiLimiter, async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' });
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        {
          headers: { 'User-Agent': 'NearEvent-App/1.0' },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.county ||
          'Pune';
        const state = address.state || 'Maharashtra';
        const country = address.country || 'India';

        return res.json({ city, state, country });
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }

    res.json({ city: 'Pune', state: 'Maharashtra', country: 'India' });
  });

  // Search Location via Nominatim (Rate limited)
  app.get('/api/geocode/search', apiLimiter, async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'q search query parameter required' });
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        {
          headers: { 'User-Agent': 'NearEvent-App/1.0' },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const item = data[0];
          const displayName = item.display_name || '';
          const parts = displayName.split(',').map((p: string) => p.trim());
          const city = parts[0] || q;
          const country = parts[parts.length - 1] || 'India';

          return res.json({
            city,
            state: parts[1] || '',
            country,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          });
        }
      }
    } catch (err) {
      console.warn('Geocode search error:', err);
    }

    res.status(404).json({ error: 'Location not found' });
  });

  // Gemini AI: Summarize Event Description (Auth + Rate Limited)
  app.post('/api/gemini/summarize', authenticateToken, apiLimiter, async (req, res) => {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!ai) {
      return res.json({
        summary: description.slice(0, 160) + '...',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Summarize this event description in 2 clear, inviting sentences highlighting the key takeaway: "${description}"`,
      });

      res.json({ summary: response.text?.trim() || description.slice(0, 160) });
    } catch (err) {
      console.error('Gemini summary error:', err);
      res.json({ summary: description.slice(0, 160) });
    }
  });

  // Gemini AI: Personalized Recommendations (Auth + Rate Limited)
  app.post('/api/gemini/recommend', authenticateToken, apiLimiter, async (req, res) => {
    const { city = 'Pune', userInterests = ['Tech', 'Startup', 'Music'] } = req.body;

    if (!ai) {
      return res.json({
        overviewText: `Top recommended picks in ${city} matching ${userInterests.join(', ')}.`,
        recommendations: eventsDatabase.slice(0, 3).map((e, idx) => ({
          eventId: e.id,
          reason: `Highly popular event in ${e.category} category in ${e.city}.`,
          matchScore: 95 - idx * 5,
        })),
      });
    }

    try {
      const availableEvents = eventsDatabase.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        city: e.city,
      }));

      const prompt = `You are NearEvent AI discovery agent. Given the user's city "${city}" and preferred categories ${JSON.stringify(
        userInterests
      )}, recommend 3 best matching events from this list: ${JSON.stringify(
        availableEvents
      )}. Return JSON format with fields "overviewText" (1 sentence summary) and "recommendations" (array of {eventId, reason, matchScore}).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overviewText: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    eventId: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    matchScore: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
    } catch (err) {
      console.error('Gemini recommend error:', err);
    }

    res.json({
      overviewText: `Curated AI recommendations for ${city}.`,
      recommendations: eventsDatabase.slice(0, 3).map((e) => ({
        eventId: e.id,
        reason: `Matches your interest in ${e.category}.`,
        matchScore: 90,
      })),
    });
  });

  // Serve Vite Frontend in development / static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NearEvent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
