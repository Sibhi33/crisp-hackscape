
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-background/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-space font-bold text-electric-blue">
              Crisp
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/hackathons" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                Hackathons
              </Link>
              <Link to="/projects" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                Projects
              </Link>
              <Link to="/teams" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                Teams
              </Link>
              <Link to="/resources" className="text-sm text-foreground/80 hover:text-electric-blue transition-colors">
                Resources
              </Link>
            </div>
          </div>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarImage src={user.user_metadata.avatar_url} />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="cyber-button text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
