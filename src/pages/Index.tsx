import { ParticleBackground } from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar"; // Add this import

const Index = () => {
  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col">
      <ParticleBackground />
      
      {/* Add the Navbar component here */}
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          {/* Hero Section with enhanced title */}
          <header className="text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-space"
            >
              Welcome to Crisp Hackscape
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-foreground/80 max-w-3xl mx-auto"
            >
              Your gateway to a world of hackathons, projects, teams, and resources.
              Dive in and start creating!
            </motion.p>
          </header>

          {/* Feature Cards with enhanced glass effect */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-background/40 backdrop-blur-sm border border-white/5">
              <div className="space-y-2 p-4">
                <h3 className="text-xl font-semibold">Hackathons</h3>
                <p className="text-sm text-foreground/70">
                  Explore upcoming hackathons and join the community.
                </p>
              </div>
            </Card>
            <Card className="bg-background/40 backdrop-blur-sm border border-white/5">
              <div className="space-y-2 p-4">
                <h3 className="text-xl font-semibold">Projects</h3>
                <p className="text-sm text-foreground/70">
                  Discover innovative projects and contribute to open source.
                </p>
              </div>
            </Card>
            <Card className="bg-background/40 backdrop-blur-sm border border-white/5">
              <div className="space-y-2 p-4">
                <h3 className="text-xl font-semibold">Teams</h3>
                <p className="text-sm text-foreground/70">
                  Find or create a team to collaborate on your next big idea.
                </p>
              </div>
            </Card>
          </section>

          {/* Resources Section */}
          <section className="text-center space-y-4">
            <h2 className="text-3xl font-semibold">Resources</h2>
            <p className="text-foreground/80">
              Access a curated list of resources to help you succeed.
            </p>
          </section>
        </motion.div>
      </main>

      {/* Footer with enhanced glass effect */}
      <footer className="border-t border-white/20 bg-background/40 backdrop-blur-xl mt-16">
        <div className="container mx-auto p-4 text-center">
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} Crisp Hackscape. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
