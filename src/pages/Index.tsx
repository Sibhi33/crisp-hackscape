
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { ParticleBackground } from '@/components/ParticleBackground';

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <ParticleBackground />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
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

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="glassmorphism p-6 card-hover">
              <h3 className="text-xl font-semibold mb-2">Active Hackathons</h3>
              <p className="text-muted-foreground">Discover ongoing competitions and join the innovation.</p>
            </Card>
            
            <Card className="glassmorphism p-6 card-hover">
              <h3 className="text-xl font-semibold mb-2">Your Projects</h3>
              <p className="text-muted-foreground">Track your progress and manage your hackathon projects.</p>
            </Card>
            
            <Card className="glassmorphism p-6 card-hover">
              <h3 className="text-xl font-semibold mb-2">Team Formation</h3>
              <p className="text-muted-foreground">Find teammates and build your dream team.</p>
            </Card>
          </section>

          <section className="mt-12">
            <button className="cyber-button">
              Start Hacking
            </button>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
