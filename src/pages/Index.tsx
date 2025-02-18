
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ParticleBackground } from '@/components/ParticleBackground';
import { Github, Code, Users, Trophy, ChevronRight, Rocket, Brain, Cpu, Globe } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col">
      <ParticleBackground />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-space font-bold text-electric-blue">
                Crisp
              </a>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                  Hackathons
                </a>
                <a href="#" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                  Projects
                </a>
                <a href="#" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                  Teams
                </a>
                <a href="#" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                  Resources
                </a>
              </div>
            </div>
            <button className="cyber-button text-sm">
              Join Now
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <header className="text-center space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-electric-blue/10 text-electric-blue text-sm font-medium mb-4">
              Welcome to Crisp
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-electric-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
              Hackathon Platform
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect, create, and collaborate in the most innovative hackathon platform
            </p>
          </header>

          {/* Feature Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glassmorphism p-6 card-hover">
              <Trophy className="w-8 h-8 text-electric-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Active Hackathons</h3>
              <p className="text-muted-foreground">Discover ongoing competitions and join the innovation.</p>
            </Card>
            
            <Card className="glassmorphism p-6 card-hover">
              <Code className="w-8 h-8 text-electric-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Projects</h3>
              <p className="text-muted-foreground">Track your progress and manage your hackathon projects.</p>
            </Card>
            
            <Card className="glassmorphism p-6 card-hover">
              <Users className="w-8 h-8 text-electric-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Formation</h3>
              <p className="text-muted-foreground">Find teammates and build your dream team.</p>
            </Card>
          </section>

          {/* Platform Features */}
          <section className="space-y-12">
            <h2 className="text-3xl font-bold text-center">Why Choose Crisp?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism p-8 space-y-4"
              >
                <Rocket className="w-10 h-10 text-electric-yellow" />
                <h3 className="text-xl font-semibold">Quick Start</h3>
                <p className="text-muted-foreground">
                  Get started in minutes with our intuitive platform and comprehensive resources.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism p-8 space-y-4"
              >
                <Brain className="w-10 h-10 text-cyber-purple" />
                <h3 className="text-xl font-semibold">AI-Powered Matching</h3>
                <p className="text-muted-foreground">
                  Find the perfect teammates with our advanced skill-based matching system.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism p-8 space-y-4"
              >
                <Cpu className="w-10 h-10 text-cyber-pink" />
                <h3 className="text-xl font-semibold">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Work seamlessly with your team using our integrated development environment.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism p-8 space-y-4"
              >
                <Globe className="w-10 h-10 text-electric-blue" />
                <h3 className="text-xl font-semibold">Global Community</h3>
                <p className="text-muted-foreground">
                  Connect with innovators worldwide and showcase your projects to a global audience.
                </p>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Hacking?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of developers and innovators building the future.
            </p>
            <button className="cyber-button inline-flex items-center">
              Start Hacking <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/80 backdrop-blur-md mt-16">
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
                <li><a href="#" className="hover:text-electric-blue transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Hackathons</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Teams</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Projects</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-electric-blue transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">API</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Support</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-electric-blue transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-electric-blue transition-colors">LinkedIn</a></li>
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

export default Index;
