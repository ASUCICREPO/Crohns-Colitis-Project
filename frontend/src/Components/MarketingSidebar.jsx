import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import programsImage from '../Assets/programs.jpeg';
import researchImage from '../Assets/research.jpeg';
import supportGroupsImage from '../Assets/support-groups.png';
import { MARKETING_BUTTON_BACKGROUND } from '../utils/constants';
const MarketingSidebar = ({ currentLanguage, onLanguageToggle }) => {
  const [eventsIndex, setEventsIndex] = useState(0);
  const [volunteerIndex, setVolunteerIndex] = useState(0);

  // Auto-scroll events every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEventsIndex(prev => (prev + 1) % baseContent.events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll volunteer opportunities every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVolunteerIndex(prev => (prev + 1) % baseContent.volunteer.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const baseContent = {
    upcomingEvents: "Upcoming Events",
    volunteeringOpportunities: "Volunteering Opportunities",
    registerHere: "Register here !!",
    applyHere: "Apply here !!",
    events: [
      {
        title: "Navigating Growth and Puberty for Kids with IBD",
        date: "Date - August 5, 2025",
        image: programsImage
      },
      {
        title: "Understanding Crohn's & Colitis Treatment Options",
        date: "Date - September 15, 2025", 
        image: researchImage
      }
    ],
    volunteer: [
      {
        title: "VOLUNTEER OPPORTUNITIES",
        subtitle: "Volunteers Needed!",
        description: "You can make a difference! Help us support IBD patients in your community.",
        image: supportGroupsImage
      },
      {
        title: "PATIENT ADVOCACY",
        subtitle: "Join Our Team!",
        description: "Help advocate for IBD patients and raise awareness about Crohn's & Colitis.",
        image: programsImage
      }
    ]
  };

  // Marketing content is static and independent of chatbot language
  const lang = baseContent;

  const CarouselControls = ({ total, current, onChange, onPrev, onNext }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
      <IconButton size="small" onClick={onPrev} sx={{ color: '#004D77' }}>
        <ChevronLeft fontSize="small" />
      </IconButton>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {Array.from({ length: total }).map((_, index) => (
          <Box
            key={index}
            onClick={() => onChange(index)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: current === index ? '#004D77' : '#ccc',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          />
        ))}
      </Box>
      <IconButton size="small" onClick={onNext} sx={{ color: '#004D77' }}>
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );

  const EventCard = ({ event, onRegister }) => (
    <Card sx={{ 
      borderRadius: 2, 
      boxShadow: 2,
      height: 240,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ position: 'relative', height: 160 }}>
        <CardMedia
          component="img"
          height="160"
          image={event.image}
          alt={event.title}
          sx={{
            objectFit: 'cover',
            width: '100%'
          }}
        />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 77, 119, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textAlign: 'center',
          p: 1
        }}>
          {event.title}
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1, color: '#666' }}>
          {event.date}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onRegister}
          sx={{
            backgroundColor: MARKETING_BUTTON_BACKGROUND,
            fontSize: '0.7rem',
            py: 0.5,
            px: 1,
            borderRadius: 1,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#006080' }
          }}
        >
          {lang.registerHere}
        </Button>
      </CardContent>
    </Card>
  );

  const VolunteerCard = ({ volunteer, onApply }) => (
    <Card sx={{ 
      borderRadius: 2, 
      boxShadow: 2,
      height: 260,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ position: 'relative', height: 160 }}>
        <CardMedia
          component="img"
          height="160"
          image={volunteer.image}
          alt={volunteer.title}
          sx={{
            objectFit: 'cover',
            width: '100%'
          }}
        />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 77, 119, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          p: 1
        }}>
          <Typography variant="body2" sx={{ fontSize: '0.65rem', fontWeight: 'bold', lineHeight: 1.2 }}>
            {volunteer.title}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.6rem', mt: 0.5, lineHeight: 1.1 }}>
            {volunteer.subtitle}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 1, color: '#666', lineHeight: 1.3 }}>
          {volunteer.description}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onApply}
          sx={{
            backgroundColor: MARKETING_BUTTON_BACKGROUND,
            fontSize: '0.7rem',
            py: 0.5,
            px: 1,
            borderRadius: 1,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#006080' }
          }}
        >
          {lang.applyHere}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{
      width: { xs: '100%', sm: 280, md: 300, lg: 320 },
      height: '100%',
      backgroundColor: '#f8f9fa',
      borderRight: { xs: 'none', sm: '1px solid #e0e0e0' },
      p: { xs: 1, sm: 1.5, md: 2 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 1.5, sm: 2 },
      overflowY: 'auto'
    }}>


      {/* Upcoming Events Section */}
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: { xs: 3, sm: 4 },
        p: { xs: 1, sm: 1.5 },
        border: `2px solid ${MARKETING_BUTTON_BACKGROUND}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minHeight: { xs: 240, sm: 280 },
        width: '100%',
        maxWidth: { xs: 280, sm: 'none' }
      }}>
        <Typography variant="h6" sx={{
          fontSize: { xs: '0.9rem', sm: '1rem' },
          fontWeight: 'bold',
          color: '#004D77',
          mb: { xs: 1.5, sm: 2 },
          textAlign: 'center'
        }}>
          {lang.upcomingEvents}
        </Typography>
        
        <EventCard 
          event={lang.events[eventsIndex]}
          onRegister={() => window.open('https://crohnscolitisfoundation.org/events', '_blank')}
        />
        
        <CarouselControls
          total={lang.events.length}
          current={eventsIndex}
          onChange={setEventsIndex}
          onPrev={() => setEventsIndex(prev => prev === 0 ? lang.events.length - 1 : prev - 1)}
          onNext={() => setEventsIndex(prev => (prev + 1) % lang.events.length)}
        />
      </Box>

      {/* Volunteering Opportunities Section */}
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: { xs: 3, sm: 4 },
        p: { xs: 1, sm: 1.5 },
        border: `2px solid ${MARKETING_BUTTON_BACKGROUND}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minHeight: { xs: 260, sm: 300 },
        width: '100%',
        maxWidth: { xs: 280, sm: 'none' }
      }}>
        <Typography variant="h6" sx={{
          fontSize: { xs: '0.9rem', sm: '1rem' },
          fontWeight: 'bold',
          color: '#004D77',
          mb: { xs: 1.5, sm: 2 },
          textAlign: 'center'
        }}>
          {lang.volunteeringOpportunities}
        </Typography>
        
        <VolunteerCard 
          volunteer={lang.volunteer[volunteerIndex]}
          onApply={() => window.open('https://crohnscolitisfoundation.org/volunteer', '_blank')}
        />
        
        <CarouselControls
          total={lang.volunteer.length}
          current={volunteerIndex}
          onChange={setVolunteerIndex}
          onPrev={() => setVolunteerIndex(prev => prev === 0 ? lang.volunteer.length - 1 : prev - 1)}
          onNext={() => setVolunteerIndex(prev => (prev + 1) % lang.volunteer.length)}
        />
      </Box>
    </Box>
  );
};

export default MarketingSidebar;