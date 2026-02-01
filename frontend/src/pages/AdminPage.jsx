import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Calendar, Users, Image, 
  Save, X, AlertCircle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { API, useAuth } from '@/App';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12" data-testid="admin-page">
      {/* Header */}
      <section className="py-8 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl font-bold text-foreground"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, <span className="font-medium text-foreground">{user?.username}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="events" data-testid="admin-events-tab">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="officers" data-testid="admin-officers-tab">
                <Users className="w-4 h-4 mr-2" />
                People
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="admin-gallery-tab">
                <Image className="w-4 h-4 mr-2" />
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <EventsManager />
            </TabsContent>

            <TabsContent value="officers">
              <OfficersManager />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

// ===================== EVENTS MANAGER =====================
const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    event_type: 'general'
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateDialog = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      event_type: 'general'
    });
    setDialogOpen(true);
  };

  const openEditDialog = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      event_type: event.event_type
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await axios.put(`${API}/events/${selectedEvent.id}`, formData, getAuthHeader());
        toast.success('Event updated successfully');
      } else {
        await axios.post(`${API}/events`, formData, getAuthHeader());
        toast.success('Event created successfully');
      }
      setDialogOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save event');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/events/${selectedEvent.id}`, getAuthHeader());
      toast.success('Event deleted successfully');
      setDeleteDialogOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      social: 'bg-green-100 text-green-800',
      academic: 'bg-blue-100 text-blue-800',
      workshop: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  }

  return (
    <div data-testid="events-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Events</h2>
        <Button onClick={openCreateDialog} data-testid="add-event-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="event-card" data-testid={`admin-event-${event.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      📍 {event.location}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(event)}
                      data-testid={`edit-event-${event.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDeleteDialog(event)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`delete-event-${event.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events yet. Create your first event!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Update the event details below.' : 'Fill in the event details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                data-testid="event-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                data-testid="event-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  data-testid="event-date-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="text"
                  placeholder="e.g., 3:00 PM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  data-testid="event-time-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                data-testid="event-location-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger data-testid="event-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="save-event-btn">
                <Save className="w-4 h-4 mr-2" />
                {selectedEvent ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-event"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ===================== OFFICERS MANAGER =====================
const OfficersManager = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image_url: '',
    email: '',
    order: 0
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchOfficers = async () => {
    try {
      const response = await axios.get(`${API}/officers`);
      setOfficers(response.data);
    } catch (error) {
      toast.error('Failed to fetch officers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const openCreateDialog = () => {
    setSelectedOfficer(null);
    setFormData({
      name: '',
      role: '',
      bio: '',
      image_url: '',
      email: '',
      order: officers.length + 1
    });
    setDialogOpen(true);
  };

  const openEditDialog = (officer) => {
    setSelectedOfficer(officer);
    setFormData({
      name: officer.name,
      role: officer.role,
      bio: officer.bio,
      image_url: officer.image_url,
      email: officer.email || '',
      order: officer.order
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (officer) => {
    setSelectedOfficer(officer);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedOfficer) {
        await axios.put(`${API}/officers/${selectedOfficer.id}`, formData, getAuthHeader());
        toast.success('Officer updated successfully');
      } else {
        await axios.post(`${API}/officers`, formData, getAuthHeader());
        toast.success('Officer added successfully');
      }
      setDialogOpen(false);
      fetchOfficers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save officer');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/officers/${selectedOfficer.id}`, getAuthHeader());
      toast.success('Officer removed successfully');
      setDeleteDialogOpen(false);
      fetchOfficers();
    } catch (error) {
      toast.error('Failed to remove officer');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  }

  return (
    <div data-testid="officers-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage People</h2>
        <Button onClick={openCreateDialog} data-testid="add-officer-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officers.length > 0 ? (
          officers.map((officer) => (
            <Card key={officer.id} data-testid={`admin-officer-${officer.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={officer.image_url}
                    alt={officer.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(officer.name)}&background=00205B&color=fff`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary">{officer.role}</span>
                    <h3 className="font-semibold text-foreground truncate">{officer.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{officer.bio}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openEditDialog(officer)}
                    data-testid={`edit-officer-${officer.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openDeleteDialog(officer)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`delete-officer-${officer.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed col-span-full">
            <CardContent className="p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No officers yet. Add your first officer!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Officer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedOfficer ? 'Edit Person' : 'Add Person'}</DialogTitle>
            <DialogDescription>
              {selectedOfficer ? 'Update the Person details below.' : 'Fill in the Person details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="officer-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., President, Treasurer"
                required
                data-testid="officer-role-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                required
                data-testid="peson-bio-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                required
                data-testid="person-image-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="person@rice.edu"
                data-testid="person-email-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                min={1}
                data-testid="officer-order-input"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="save-officer-btn">
                <Save className="w-4 h-4 mr-2" />
                {selectedOfficer ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Person</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedOfficer?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-officer"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ===================== GALLERY MANAGER =====================
const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    caption: '',
    order: 0
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setImages(response.data);
    } catch (error) {
      toast.error('Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const openCreateDialog = () => {
    setFormData({
      url: '',
      caption: '',
      order: images.length + 1
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (image) => {
    setSelectedImage(image);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/gallery`, formData, getAuthHeader());
      toast.success('Image added successfully');
      setDialogOpen(false);
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add image');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/gallery/${selectedImage.id}`, getAuthHeader());
      toast.success('Image removed successfully');
      setDeleteDialogOpen(false);
      fetchImages();
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner" /></div>;
  }

  return (
    <div data-testid="gallery-manager">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Gallery</h2>
        <Button onClick={openCreateDialog} data-testid="add-image-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.length > 0 ? (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden" data-testid={`admin-image-${image.id}`}>
              <div className="aspect-video relative">
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => openDeleteDialog(image)}
                  data-testid={`delete-image-${image.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{image.caption}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed col-span-full">
            <CardContent className="p-8 text-center">
              <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No images yet. Add your first gallery image!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Image Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Gallery Image</DialogTitle>
            <DialogDescription>
              Add a new image to the photo carousel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Image URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                required
                data-testid="gallery-url-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={2}
                required
                data-testid="gallery-caption-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-order">Display Order</Label>
              <Input
                id="gallery-order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                min={1}
                data-testid="gallery-order-input"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="save-image-btn">
                <Save className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-image"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
