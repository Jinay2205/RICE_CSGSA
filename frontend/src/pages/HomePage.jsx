import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ChevronRight, ChevronLeft, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { API } from '@/App';

// Hero Section Component
const HeroSection = () => {
  return (
    <section 
      className="hero-section relative pt-20"
      data-testid="hero-section"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80')`
        }}
      />
      <div className="hero-overlay" />
      
      {/* Content */}
      <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-slide-up"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Rice Computer Science{' '}
            <span className="text-gradient">Graduate Student Association</span>
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up stagger-1"
            style={{ opacity: 0 }}
          >
            Building community, representing student voices, and enhancing graduate 
            life in Computer Science at Rice University.
          </p>
          <div 
            className="flex flex-wrap gap-4 animate-slide-up stagger-2"
            style={{ opacity: 0 }}
          >
            <Link to="/events">
              <Button 
                size="lg" 
                className="rounded-full px-8 shadow-lg btn-pulse"
                data-testid="hero-view-events-btn"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Events
              </Button>
            </Link>
            <Link to="/leadership">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8"
                data-testid="hero-join-community-btn"
              >
                <Users className="w-5 h-5 mr-2" />
                Join the Community
              </Button>
            </Link>
            <a href="mailto:csgsa@rice.edu">
              <Button 
                size="lg" 
                variant="ghost" 
                className="rounded-full px-8"
                data-testid="hero-contact-btn"
              >
                Contact Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

// Photo Carousel Component
const PhotoCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goTo = (index) => setCurrentIndex(index);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  if (images.length === 0) return null;

  return (
    <section 
      className="py-20 md:py-32 bg-muted/30"
      data-testid="photo-carousel-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Life at CS GSA
          </h2>
          <p className="text-muted-foreground">
            A glimpse into CS GSA events — where community meets collaboration.
          </p>
        </div>

        <div className="relative carousel-container aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl shadow-2xl">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            >
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-white text-sm md:text-base font-medium">
                  {image.caption}
                </p>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            data-testid="carousel-next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                data-testid={`carousel-dot-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Events Preview Component
const EventsPreview = ({ events }) => {
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .slice(0, 3);

  const getEventTypeColor = (type) => {
    const colors = {
      social: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      general: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[type] || colors.general;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section 
      className="py-20 md:py-32"
      data-testid="events-preview-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Upcoming Events
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Join us for workshops, talks, social gatherings, and more. 
              There's always something happening in the CS GSA community.
            </p>
          </div>
          <Link to="/events" className="mt-6 md:mt-0">
            <Button variant="outline" className="rounded-full" data-testid="view-all-events-btn">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card 
                key={event.id} 
                className="event-card card-hover border-border/50"
                data-testid={`event-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Upcoming Events
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new events or visit our events page.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

// About Section Component
const AboutSection = () => {
  return (
    <section 
      className="py-20 md:py-32 bg-primary text-white"
      data-testid="about-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              Our Mission
            </h2>
            <div className="space-y-4 text-white/90">
              <p className="text-lg leading-relaxed">
                The Rice Computer Science Graduate Student Association (CS GSA) serves as 
                the representative body for graduate students in the Department of Computer 
                Science at Rice University.
              </p>
              <p className="leading-relaxed">
                Our mission is to strengthen communication and community within the department, 
                organize events that support academic, professional, and social growth, and 
                represent student interests to faculty and administration.
              </p>
              <p className="leading-relaxed">
                Through workshops, research talks, social gatherings, and advocacy initiatives, 
                the CS GSA fosters an inclusive, respectful, and collaborative environment 
                where graduate students can thrive both academically and personally.
              </p>
            </div>
            <div className="mt-8">
              <Link to="/leadership">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="rounded-full bg-white text-primary hover:bg-white/90"
                  data-testid="meet-leadership-btn"
                >
                  Meet Our Leadership
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                alt="Students collaborating"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Main HomePage Component
const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, galleryRes] = await Promise.all([
          axios.get(`${API}/events`),
          axios.get(`${API}/gallery`)
        ]);
        setEvents(eventsRes.data);
        setGallery(galleryRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      <HeroSection />
      <PhotoCarousel images={gallery} />
      <EventsPreview events={events} />
      <AboutSection />
    </div>
  );
};

export default HomePage;
