"use client";
import { Navbar } from "@/components/Navbar";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Card, CardTitle } from "@/components/ui/card-hover-effect";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { PinContainer } from "@/components/ui/3d-pin";
import React from "react";

const Projects = () => {
  const projectCategories = [
    "Health-Tech",
    "AI / ML",
    "Web3 & Blockchain",
    "Agri-Tech",
    "Open-Innovation",
    "Automation",
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col">
      <ParticleBackground />
      <Navbar />
      <TypewriterEffectSmoothDemo />

      {/* Grid layout with 6 cards having 3D hover effect */}
      <div className="container mx-4 px-4 py-12 ">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          {projectCategories.map((category, index) => (
            <PinContainer key={index} title={category}>
              <Card className="flex items-center justify-center text-center w-[20rem] h-[10rem] bg-gradient-to-r from-purple-400 to-purple-700">
                <CardTitle className="text-2xl">{category}</CardTitle>
              </Card>
            </PinContainer>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-background/40 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Hackathons
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Teams
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Projects
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
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

function TypewriterEffectSmoothDemo() {
  const words = [
    { text: "Build", className: "text-white-500 dark:text-blue-500 text-5xl font-sans" },
    { text: "awesome", className: "text-white-500 dark:text-blue-500 text-5xl font-sans" },
    { text: "apps", className: "text-white-500 dark:text-blue-500 text-5xl font-sans" },
    { text: "with", className: "text-white-500 dark:text-blue-500 text-5xl font-sans" },
    { text: "Crisp.", className: "text-blue-500 dark:text-blue-500 text-5xl font-sans" },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[10rem] z-50">
      <TypewriterEffectSmooth words={words} />
      <p className="text-xl">Explore our array of project resources and source codes</p>
      <p className="text-xl">categorized into problem statements below</p>
    </div>
  );
}

export default Projects;
