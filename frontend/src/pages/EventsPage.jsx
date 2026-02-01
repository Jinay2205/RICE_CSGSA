import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, MapPin, Clock, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { API } from '@/App';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('calendar');
  const [filters, setFilters] = useState({
    social: true,
    academic: true,
    workshop: true,
    general: true
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventTypeColor = (type) => {
    const colors = {
      social: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    };
    return colors[type] || colors.general;
  };

  const getEventDotColor = (type) => {
    const colors = {
      social: 'bg-green-500',
      academic: 'bg-blue-500',
      workshop: 'bg-purple-500',
      general: 'bg-gray-500'
    };
    return colors[type] || colors.general;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const generateGoogleCalendarUrl = (event) => {
    const startDate = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
      details: event.description,
      location: event.location
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12';
    } else if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes || '00'}:00`;
  };

  const filteredEvents = events.filter(event => filters[event.event_type]);
  
  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = filteredEvents
    .filter(e => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const eventDates = events.map(e => new Date(e.date));

  const getEventsForDate = (date) => {
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD (local)
    return filteredEvents.filter(e => e.date === dateStr);
  };
  

  const selectedDateEvents = getEventsForDate(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="events-page">
      {/* Header */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Events & Calendar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Stay connected with the CS GSA community. Browse upcoming events, 
            workshops, research talks, and social gatherings.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="calendar" data-testid="calendar-view-tab">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" data-testid="list-view-tab">
                  <List className="w-4 h-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="filter-dropdown">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(filters).map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={filters[type]}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ ...prev, [type]: checked }))
                    }
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${getEventDotColor(type)}`} />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <Card className="lg:col-span-1" data-testid="calendar-card">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={{
                      hasEvent: eventDates
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'hsl(var(--accent))'
                      }
                    }}
                    className="w-full"
                  />
                  {/* Legend */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Event Types</p>
                    <div className="flex flex-wrap gap-2">
                      {['social', 'academic', 'workshop', 'general'].map(type => (
                        <span 
                          key={type}
                          className="inline-flex items-center text-xs text-muted-foreground"
                        >
                          <span className={`w-2 h-2 rounded-full mr-1 ${getEventDotColor(type)}`} />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Date Events */}
              <div className="lg:col-span-2 space-y-4" data-testid="selected-date-events">
                <h2 className="text-xl font-semibold text-foreground">
                  {formatDate(selectedDate)}
                </h2>
                
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      getEventTypeColor={getEventTypeColor}
                      generateGoogleCalendarUrl={generateGoogleCalendarUrl}
                    />
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No events on this date</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="space-y-12">
              {/* Upcoming Events */}
              <div data-testid="upcoming-events-section">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Upcoming Events
                </h2>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        showDate
                        getEventTypeColor={getEventTypeColor}
                        generateGoogleCalendarUrl={generateGoogleCalendarUrl}
                        formatShortDate={formatShortDate}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No upcoming events</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div data-testid="past-events-section">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Past Events
                  </h2>
                  <div className="space-y-4 opacity-70">
                    {pastEvents.slice(0, 5).map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        showDate
                        isPast
                        getEventTypeColor={getEventTypeColor}
                        formatShortDate={formatShortDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Event Card Component
const EventCard = ({ 
  event, 
  showDate, 
  isPast,
  getEventTypeColor, 
  generateGoogleCalendarUrl,
  formatShortDate 
}) => {
  return (
    <Card 
      className={`event-card transition-all ${isPast ? 'opacity-60' : ''}`}
      data-testid={`event-card-${event.id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Date Badge (for list view) */}
          {showDate && (
            <div className="flex-shrink-0 w-16 text-center">
              <div className="bg-primary/10 rounded-lg py-2 px-3">
                <span className="text-sm font-bold text-primary block">
                  {formatShortDate?.(event.date)}
                </span>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.event_type)}`}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {event.time}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isPast && generateGoogleCalendarUrl && (
            <div className="flex-shrink-0">
              <a 
                href={generateGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full"
                  data-testid={`add-to-calendar-${event.id}`}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsPage;
