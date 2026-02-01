import { useState, useEffect } from 'react';
import { Mail, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API } from '@/App';

const LeadershipPage = () => {
  // 1. Updated state name from 'officers' to 'people'
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        // Keeping the endpoint as /officers unless you decide to rename it in server.py
        const response = await axios.get(`${API}/officers`);
        setPeople(response.data);
      } catch (error) {
        console.error('Error fetching people:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="leadership-page">
      {/* Header */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {/* 2. Updated Heading */}
            Our People
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Meet the dedicated team of graduate students leading the CS GSA. 
            We're here to support, represent, and advocate for our community.
          </p>
        </div>
      </section>

      {/* People Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {people.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {people.map((person, index) => (
                <PersonCard 
                  key={person.id} 
                  person={person} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed max-w-md mx-auto">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {/* 3. Updated Empty State Text */}
                  Team Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Check back later to meet our people.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Join Section - Unchanged as per Rice CS GSA branding */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Join the CS GSA
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            All CS graduate students at Rice are automatically members of the CS GSA. 
            Want to get more involved? We're always looking for volunteers and future leaders.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:csgsa@rice.edu">
              <Button size="lg" className="rounded-full" data-testid="contact-us-btn">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </a>
            <a href="mailto:csgsa@rice.edu?subject=Volunteer Interest">
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full"
                data-testid="volunteer-btn"
              >
                Volunteer
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

// 4. Renamed Component from OfficerCard to PersonCard
const PersonCard = ({ person, index }) => {
  return (
    <Card 
      className="person-card card-hover overflow-hidden"
      data-testid={`person-card-${index}`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={person.image_url}
            alt={person.name}
            className="person-image w-full h-full object-cover"
            onError={(e) => {
              // Fallback for broken Drive links
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=400&background=00205B&color=fff`;
            }}
          />
        </div>
        
        {/* Info */}
        <div className="p-6">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {person.role}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {person.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {person.bio}
          </p>
          {person.email && (
            <a 
              href={`mailto:${person.email}`}
              className="inline-flex items-center text-sm text-primary hover:underline"
              data-testid={`person-email-${index}`}
            >
              <Mail className="w-4 h-4 mr-1" />
              {person.email}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadershipPage;