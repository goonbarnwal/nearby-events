export function getCleanRegistrationUrl(url?: string, category?: string, title?: string): string {
  const cleanUrl = url ? url.trim() : '';
  const catLower = (category || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  // 1. Check if url is a known safe working platform link that does not block users
  if (cleanUrl && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
    const isForbidden =
      cleanUrl.includes('bookmyshow') ||
      cleanUrl.includes('unstop') ||
      cleanUrl.includes('insider.in') ||
      cleanUrl.includes('thegrubfest') ||
      cleanUrl.includes('bharatdrone') ||
      cleanUrl.includes('delhihalfmarathon') ||
      cleanUrl.includes('tuffmanindia') ||
      cleanUrl.includes('example.com') ||
      cleanUrl.includes('near-event.app') ||
      cleanUrl.includes('/find/tech/') ||
      cleanUrl.includes('india--delhi');

    const isSafe =
      (cleanUrl.includes('devfolio.co') ||
      cleanUrl.includes('meetup.com') ||
      cleanUrl.includes('eventbrite.in') ||
      cleanUrl.includes('eventbrite.com') ||
      cleanUrl.includes('lu.ma') ||
      cleanUrl.includes('luma.com') ||
      cleanUrl.includes('paytm.com/events')) &&
      !isForbidden;

    if (isSafe) {
      return cleanUrl;
    }
  }

  // 2. Hackathons & Coding
  if (catLower.includes('hackathon') || titleLower.includes('hackathon') || titleLower.includes('coding')) {
    return 'https://devfolio.co/hackathons';
  }

  // 3. Music, Comedy, Food, Sports, Cultural, Shows, Festivals
  if (
    catLower.includes('music') ||
    catLower.includes('concert') ||
    catLower.includes('comedy') ||
    catLower.includes('standup') ||
    catLower.includes('show') ||
    catLower.includes('food') ||
    catLower.includes('culinary') ||
    catLower.includes('festival') ||
    catLower.includes('sports') ||
    catLower.includes('fitness') ||
    catLower.includes('marathon') ||
    titleLower.includes('comedy') ||
    titleLower.includes('music') ||
    titleLower.includes('food') ||
    titleLower.includes('festival')
  ) {
    return 'https://www.eventbrite.in';
  }

  // 4. Default for Tech, Business, Meetups, etc.
  return 'https://www.meetup.com/find/';
}
