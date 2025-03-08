'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Search, Calendar, MapPin, Users, Filter, ChevronRight, Clock, Trophy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';


const HackathonListings = () => {
  const [filter, setFilter] = useState('all');
  
  // Sample hackathon data
  const hackathons = [
    {
      id: 1,
      title: "CyberSprint 2025",
      organizer: "TechFusion Labs",
      location: "San Francisco, CA",
      date: "March 15-17, 2025",
      participants: 342,
      status: "active",
      category: "AI & Machine Learning",
      prizePool: "$15,000",
      timeLeft: "7 days left",
      difficulty: "Advanced"
    },
    {
      id: 2,
      title: "BlockchainBuild",
      organizer: "Decentralized Future",
      location: "Virtual",
      date: "April 5-7, 2025",
      participants: 275,
      status: "upcoming",
      category: "Blockchain",
      prizePool: "$10,000",
      timeLeft: "28 days left",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "GreenTech Innovation",
      organizer: "Sustainable Solutions",
      location: "Boston, MA",
      date: "March 28-30, 2025",
      participants: 198,
      status: "active",
      category: "Climate Tech",
      prizePool: "$12,000",
      timeLeft: "20 days left",
      difficulty: "Beginner-Friendly"
    },
    {
      id: 4,
      title: "HealthHack 2025",
      organizer: "MedTech Alliance",
      location: "Chicago, IL",
      date: "May 10-12, 2025",
      participants: 230,
      status: "upcoming",
      category: "Healthcare",
      prizePool: "$20,000",
      timeLeft: "63 days left",
      difficulty: "All Levels"
    },
    {
      id: 5,
      title: "Quantum Computing Challenge",
      organizer: "FutureWave Computing",
      location: "Virtual",
      date: "March 20-22, 2025",
      participants: 156,
      status: "active",
      category: "Quantum Computing",
      prizePool: "$25,000",
      timeLeft: "12 days left",
      difficulty: "Advanced"
    },
    {
      id: 6,
      title: "AR/VR Immersive Jam",
      organizer: "Reality Shift",
      location: "Austin, TX",
      date: "April 15-17, 2025",
      participants: 210,
      status: "upcoming",
      category: "AR/VR",
      prizePool: "$18,000",
      timeLeft: "38 days left",
      difficulty: "Intermediate"
    }
  ];

  const filteredHackathons = filter === 'all' 
    ? hackathons 
    : hackathons.filter(hackathon => hackathon.status === filter);

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col">
      <ParticleBackground />

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <header className="text-center space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-electric-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent drop-shadow-lg"
            >
              Discover Hackathons
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Find your next challenge and build something amazing with innovators worldwide
            </motion.p>
          </header>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glassmorphism rounded-xl p-5 border border-white/20 bg-background/40 backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search hackathons..." 
                  className="w-full bg-background/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg border ${filter === 'all' ? 'bg-electric-blue text-white border-electric-blue' : 'border-white/20 bg-background/20 hover:bg-background/40'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-lg border ${filter === 'active' ? 'bg-electric-blue text-white border-electric-blue' : 'border-white/20 bg-background/20 hover:bg-background/40'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg border ${filter === 'upcoming' ? 'bg-electric-blue text-white border-electric-blue' : 'border-white/20 bg-background/20 hover:bg-background/40'}`}
                >
                  Upcoming
                </button>
                <button className="p-2 rounded-lg border border-white/20 bg-background/20 hover:bg-background/40">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Hackathon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glassmorphism p-6 border border-white/20 bg-gradient-to-r from-background/40 to-cyber-purple/10 backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 px-4 py-2 bg-cyber-pink/80 text-white text-sm font-bold rounded-bl-lg">
                Featured
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-2xl font-bold text-white">Global AI Impact Challenge</h2>
                  <p className="text-muted-foreground">
                    Build AI-powered solutions addressing critical global challenges from climate change to healthcare access.
                    Collaborate with experts and compete for the grand prize.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-electric-blue">
                      <Calendar className="w-4 h-4" />
                      <span>April 1-3, 2025</span>
                    </div>
                    <div className="flex items-center gap-1 text-electric-blue">
                      <MapPin className="w-4 h-4" />
                      <span>Hybrid (Online & NYC)</span>
                    </div>
                    <div className="flex items-center gap-1 text-electric-blue">
                      <Users className="w-4 h-4" />
                      <span>500+ Participants</span>
                    </div>
                    <div className="flex items-center gap-1 text-electric-blue">
                      <Trophy className="w-4 h-4" />
                      <span>$50,000 Prize Pool</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <button className="cyber-button inline-flex items-center">
                    View Details <ChevronRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Hackathon Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="glassmorphism h-full p-6 card-hover border border-white/20 bg-background/40 backdrop-blur-xl relative overflow-hidden flex flex-col">
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${hackathon.status === 'active' ? 'bg-electric-blue/90' : 'bg-cyber-purple/90'} rounded-bl-lg`}>
                    {hackathon.status === 'active' ? 'Active' : 'Upcoming'}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-background/40 text-cyber-pink text-xs font-medium mb-3 backdrop-blur-md border border-cyber-pink/20">
                    {hackathon.category}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Organized by {hackathon.organizer}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{hackathon.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{hackathon.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{hackathon.participants} participants</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-electric-blue font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{hackathon.timeLeft}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-cyber-pink font-medium">
                        <Trophy className="w-3 h-3" />
                        <span>{hackathon.prizePool}</span>
                      </div>
                    </div>
                    
                    <button className="w-full px-4 py-2 border border-electric-blue/70 text-electric-blue hover:bg-electric-blue/10 rounded-lg text-sm transition-colors flex items-center justify-center">
                      View Details <ChevronRight className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* Load More Button */}
          <div className="text-center mt-10">
            <button className="px-6 py-3 border border-white/20 bg-background/40 hover:bg-background/60 rounded-lg backdrop-blur-xl transition-colors inline-flex items-center gap-2">
              Load More Hackathons
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer with enhanced glass effect */}
      <footer className="border-t border-white/20 bg-background/40 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-electric-blue">Crisp</h4>
              <p className="text-sm text-muted-foreground">
                Building the future of hackathons and innovation.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Hackathons
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Teams
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-electric-blue transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Crisp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HackathonListings;