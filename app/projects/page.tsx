'use client';
import { Navbar } from '@/components/Navbar';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card, CardTitle } from '@/components/ui/card-hover-effect';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { PinContainer } from '@/components/ui/3d-pin';
import React from 'react';
import { 
  BrainCircuit, 
  Heart, 
  Leaf, 
  Lightbulb, 
  Bot,
  Terminal,
  Wifi,
  Shield,
  CloudCog,
  Database,
  Palette,
  Glasses,
  Satellite,
  BookOpen,
  Building
} from 'lucide-react';
import Image from 'next/image';

const Projects = () => {
  const projectCategories = [
    {
      name: 'Health-Tech',
      description: 'Healthcare innovations and medical solutions',
      icon: <Heart className="h-8 w-8 mb-2 text-pink-500" />,
      gradient: 'from-pink-500 to-rose-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/healthcare-ai'
    },
    {
      name: 'AI / ML',
      description: 'Artificial intelligence and machine learning projects',
      icon: <BrainCircuit className="h-8 w-8 mb-2 text-indigo-400" />,
      gradient: 'from-indigo-500 to-blue-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/machine-learning'
    },
    {
      name: 'Web3 & Blockchain',
      description: 'Decentralized apps and blockchain solutions',
      icon: <Terminal className="h-8 w-8 mb-2 text-blue-400" />,
      gradient: 'from-blue-500 to-cyan-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/blockchain'
    },
    {
      name: 'Agri-Tech',
      description: 'Agricultural technology and sustainable farming',
      icon: <Leaf className="h-8 w-8 mb-2 text-green-400" />,
      gradient: 'from-green-500 to-emerald-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/agriculture'
    },
    {
      name: 'Open-Innovation',
      description: 'Open-source projects and collaborative solutions',
      icon: <Lightbulb className="h-8 w-8 mb-2 text-amber-400" />,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/open-innovation'
    },
    {
      name: 'Automation',
      description: 'Robotics and process automation technologies',
      icon: <Bot className="h-8 w-8 mb-2 text-fuchsia-400" />,
      gradient: 'from-fuchsia-500 to-purple-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/automation'
    },
    {
      name: 'IoT',
      description: 'Internet of Things and connected devices',
      icon: <Wifi className="h-8 w-8 mb-2 text-blue-400" />,
      gradient: 'from-blue-400 to-sky-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/internet-of-things'
    },
    {
      name: 'Cybersecurity',
      description: 'Security solutions and threat protection',
      icon: <Shield className="h-8 w-8 mb-2 text-red-400" />,
      gradient: 'from-red-500 to-rose-700',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/cybersecurity'
    },
    {
      name: 'Cloud Computing',
      description: 'Cloud infrastructure and serverless applications',
      icon: <CloudCog className="h-8 w-8 mb-2 text-blue-300" />,
      gradient: 'from-blue-400 to-indigo-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/cloud-computing'
    },
    {
      name: 'Big Data',
      description: 'Data analytics and processing at scale',
      icon: <Database className="h-8 w-8 mb-2 text-emerald-400" />,
      gradient: 'from-emerald-500 to-teal-700',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/big-data'
    },
    {
      name: 'AR/VR',
      description: 'Augmented and virtual reality experiences',
      icon: <Glasses className="h-8 w-8 mb-2 text-violet-400" />,
      gradient: 'from-violet-500 to-purple-700',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/augmented-reality'
    },
    {
      name: 'Space Tech',
      description: 'Space exploration and satellite technologies',
      icon: <Satellite className="h-8 w-8 mb-2 text-slate-300" />,
      gradient: 'from-slate-700 to-slate-900',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/space'
    },
    {
      name: 'EdTech',
      description: 'Educational technology and learning platforms',
      icon: <BookOpen className="h-8 w-8 mb-2 text-orange-400" />,
      gradient: 'from-orange-500 to-red-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/education'
    },
    {
      name: 'FinTech',
      description: 'Financial technology and payment solutions',
      icon: <Building className="h-8 w-8 mb-2 text-green-400" />,
      gradient: 'from-green-600 to-emerald-700',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/fintech'
    },
    {
      name: 'Creative Tech',
      description: 'Digital art, music, and creative coding',
      icon: <Palette className="h-8 w-8 mb-2 text-pink-400" />,
      gradient: 'from-pink-400 to-purple-600',
      textColor: 'text-white',
      repoLink: 'https://github.com/topics/creative-coding'
    },
  ];

  const domainProjects = {
    'Health-Tech': [
      {
        title: 'Medical Diagnosis AI',
        description: 'Deep learning for medical imaging analysis',
        image: '/globe.svg',
        href: '/projects/medical-ai'
      },
      {
        title: 'Patient Monitoring System',
        description: 'IoT-based real-time health monitoring',
        image: '/window.svg',
        href: '/projects/patient-monitor'
      },
      {
        title: 'Mental Health App',
        description: 'Cognitive behavioral therapy platform',
        image: '/file.svg',
        href: '/projects/mental-health'
      }
    ],
    'AI / ML': [
      {
        title: 'NLP Document Analyzer',
        description: 'Natural language processing for document analysis',
        image: '/globe.svg',
        href: '/projects/nlp-analyzer'
      },
      {
        title: 'Computer Vision System',
        description: 'Object detection and classification',
        image: '/file.svg',
        href: '/projects/cv-system'
      },
      {
        title: 'Recommendation Engine',
        description: 'Personalized content recommendation',
        image: '/window.svg',
        href: '/projects/recommender'
      }
    ],
    'Web3 & Blockchain': [
      {
        title: 'Decentralized Exchange',
        description: 'Crypto trading without intermediaries',
        image: '/file.svg',
        href: '/projects/dex'
      },
      {
        title: 'NFT Marketplace',
        description: 'Create and trade digital collectibles',
        image: '/globe.svg',
        href: '/projects/nft'
      },
      {
        title: 'DAO Governance Tool',
        description: 'Decentralized organization management',
        image: '/window.svg',
        href: '/projects/dao'
      }
    ],
    'Agri-Tech': [
      {
        title: 'Precision Farming System',
        description: 'IoT sensors for optimal crop management',
        image: '/window.svg',
        href: '/projects/precision-farming'
      },
      {
        title: 'Supply Chain Tracker',
        description: 'Blockchain for agricultural supply chain',
        image: '/file.svg',
        href: '/projects/agri-supply-chain'
      }
    ],
    'Open-Innovation': [
      {
        title: 'Collaborative Research Platform',
        description: 'Open science research coordination',
        image: '/globe.svg',
        href: '/projects/open-research'
      },
      {
        title: 'Citizen Science App',
        description: 'Community-driven data collection',
        image: '/file.svg',
        href: '/projects/citizen-science'
      }
    ]
  };

  const allDomainProjects = {
    ...domainProjects,
    'Automation': [
      {
        title: 'Warehouse Robotics',
        description: 'Automated inventory management',
        image: '/window.svg',
        href: '/projects/warehouse-robotics'
      },
      {
        title: 'Process Automation Tool',
        description: 'Workflow optimization software',
        image: '/file.svg',
        href: '/projects/process-automation'
      }
    ],
    'IoT': [
      {
        title: 'Smart Home System',
        description: 'Connected home automation',
        image: '/globe.svg',
        href: '/projects/smart-home'
      },
      {
        title: 'Industrial IoT Platform',
        description: 'Factory monitoring and control',
        image: '/window.svg',
        href: '/projects/industrial-iot'
      }
    ],
    'Cybersecurity': [
      {
        title: 'Threat Detection System',
        description: 'AI-powered security monitoring',
        image: '/file.svg',
        href: '/projects/threat-detection'
      },
      {
        title: 'Secure Messaging App',
        description: 'End-to-end encrypted communication',
        image: '/globe.svg',
        href: '/projects/secure-messaging'
      }
    ],
    'Cloud Computing': [
      {
        title: 'Serverless Application',
        description: 'Event-driven cloud architecture',
        image: '/window.svg',
        href: '/projects/serverless'
      },
      {
        title: 'Multi-Cloud Manager',
        description: 'Unified cloud resource management',
        image: '/file.svg',
        href: '/projects/multi-cloud'
      }
    ],
    'Big Data': [
      {
        title: 'Real-time Analytics Engine',
        description: 'Stream processing for big data',
        image: '/globe.svg',
        href: '/projects/real-time-analytics'
      },
      {
        title: 'Data Visualization Platform',
        description: 'Interactive dashboards for insights',
        image: '/window.svg',
        href: '/projects/data-viz'
      }
    ],
    'AR/VR': [
      {
        title: 'Virtual Training Simulator',
        description: 'Immersive skills development',
        image: '/file.svg',
        href: '/projects/vr-training'
      },
      {
        title: 'AR Navigation App',
        description: 'Augmented reality wayfinding',
        image: '/globe.svg',
        href: '/projects/ar-navigation'
      }
    ],
    'Space Tech': [
      {
        title: 'Satellite Data Analysis',
        description: 'Earth observation insights',
        image: '/window.svg',
        href: '/projects/satellite-data'
      },
      {
        title: 'Space Debris Tracker',
        description: 'Monitoring orbital environment',
        image: '/file.svg',
        href: '/projects/space-debris'
      }
    ],
    'EdTech': [
      {
        title: 'Adaptive Learning Platform',
        description: 'Personalized education system',
        image: '/globe.svg',
        href: '/projects/adaptive-learning'
      },
      {
        title: 'Virtual Classroom',
        description: 'Interactive remote learning',
        image: '/window.svg',
        href: '/projects/virtual-classroom'
      }
    ],
    'FinTech': [
      {
        title: 'Personal Finance Manager',
        description: 'AI-powered budget optimization',
        image: '/file.svg',
        href: '/projects/finance-manager'
      },
      {
        title: 'Cryptocurrency Payment System',
        description: 'Blockchain payment processing',
        image: '/globe.svg',
        href: '/projects/crypto-payments'
      }
    ],
    'Creative Tech': [
      {
        title: 'Generative Art Platform',
        description: 'AI-assisted digital art creation',
        image: '/window.svg',
        href: '/projects/generative-art'
      },
      {
        title: 'Interactive Music Experience',
        description: 'Gesture-controlled sound design',
        image: '/file.svg',
        href: '/projects/interactive-music'
      }
    ]
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col bg-gray-950">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 my-8">
        <TypewriterEffectSmoothDemo />
      </div>

      {/* Project categories with improved styling */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Hackathon Domains
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {projectCategories.map((category, index) => (
            <div key={index} className="flex justify-center">
              <PinContainer 
                title={category.name} 
                description={category.description}
                href={category.repoLink}
              >
                <Card className={`flex flex-col items-center justify-center text-center w-[280px] h-[200px] bg-gradient-to-r ${category.gradient} rounded-xl shadow-lg overflow-hidden group border-0`}>
                  <div className="relative z-10 p-5 flex flex-col items-center justify-center h-full w-full">
                    {category.icon}
                    <CardTitle className={`text-2xl font-bold ${category.textColor}`}>
                      {category.name}
                    </CardTitle>
                  </div>
                </Card>
              </PinContainer>
            </div>
          ))}
        </div>
      </div>

      {/* Add a new section for domain projects */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <h2 className="text-3xl font-bold mb-12 text-center text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Featured Projects by Domain
          </span>
        </h2>

        {projectCategories.map((category, categoryIndex) => {
          const projects = allDomainProjects[category.name as keyof typeof allDomainProjects];
          
          if (!projects || projects.length === 0) return null;
          
          return (
            <div key={categoryIndex} className="mb-16">
              <h3 className="text-2xl font-bold mb-6 text-white">
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${category.gradient}`}>
                  {category.name}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, projectIndex) => (
                  <div key={projectIndex} className="flex justify-center h-[250px]">
                    <PinContainer
                      title={project.title}
                      description={project.description}
                      href={project.href}
                    >
                      <div className="flex flex-col items-center justify-center w-[280px] h-[200px] bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-800 group transition-all duration-200">
                        <div className="relative w-full h-3/5 overflow-hidden">
                          <Image
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-contain p-4"
                            width={280}
                            height={120}
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h4 className="text-lg font-bold text-white mb-1">{project.title}</h4>
                          <p className="text-sm text-gray-300">{project.description}</p>
                        </div>
                      </div>
                    </PinContainer>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to action section */}
      <div className="container mx-auto py-16 px-4 relative z-10">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-8 backdrop-blur-sm shadow-xl">
          <h3 className="text-2xl font-bold text-white text-center mb-4">Ready to showcase your project?</h3>
          <p className="text-center text-white/80 mb-6">Join our community and collaborate with other innovators to build amazing solutions.</p>
          <div className="flex justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-blue-500/25">
              Start Building Today
            </button>
          </div>
        </div>
      </div>

      {/* Footer with improved styling */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl mt-auto relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-blue-400">Crisp</h4>
              <p className="text-sm text-gray-400">
                Building the future of hackathons and innovation.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Hackathons
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Teams
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Projects
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Crisp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: 'Explore',
      className: 'text-blue-500 dark:text-blue-500 text-5xl font-sans',
    },
    {
      text: 'innovative',
      className: 'text-white-500 dark:text-blue-400 text-5xl font-sans',
    },
    {
      text: 'hackathon',
      className: 'text-white-500 dark:text-blue-400 text-5xl font-sans',
    },
    {
      text: 'domains',
      className: 'text-cyan-500 dark:text-cyan-500 text-5xl font-sans',
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[10rem] z-50">
      <TypewriterEffectSmooth words={words} />
      <p className="text-xl mt-4 text-gray-200">
        Click on any domain to browse related GitHub projects
      </p>
    </div>
  );
}

export default Projects;
