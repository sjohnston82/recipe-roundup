import { Link, useNavigate } from "@tanstack/react-router";
import { useSession, signOut } from "../lib/auth-client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SearchBar from "./SearchBar";

interface HeaderProps {
  onSearch?: (query: string) => void;
  hideSignIn?: boolean;
  hideSignUp?: boolean;
}

export default function Header({
  onSearch,
  hideSignIn,
  hideSignUp,
}: HeaderProps) {
  const { data: session } = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 inset-x-0 bg-gradient-to-r from-gradient-dark to-gradient-light shadow-xl border-b border-white/10 backdrop-blur-md z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center flex-1">
            <Link
              to="/"
              className="text-2xl font-bold text-white hover:text-accent-peach transition-colors duration-200"
            >
              Recipe Roundup
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-end">
            {session ? (
              <>
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm">
                    Welcome, {session.user?.name || session.user?.email}
                  </span>

                  {/* Avatar with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full">
                        <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-transparent transition-all">
                          <AvatarImage
                            src={session.user?.image || ""}
                            alt={session.user?.name || "User"}
                          />
                          <AvatarFallback className="bg-white text-gradient-dark text-sm font-medium">
                            {session.user?.name
                              ? getInitials(session.user.name)
                              : session.user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => navigate({ to: "/profile" })}
                        className="cursor-pointer"
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {!hideSignIn && (
                  <Link
                    to="/signin"
                    className="text-white hover:text-accent-peach transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                )}
                {!hideSignUp && (
                  <Link to="/signup">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white text-white hover:bg-white hover:text-gradient-dark transition-colors duration-200"
                    >
                      Sign Up
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </nav>

          {/* Mobile avatar dropdown - Only show when logged in */}
          {session && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-full">
                    <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-transparent transition-all">
                      <AvatarImage
                        src={session.user?.image || ""}
                        alt={session.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-white text-gradient-dark text-sm font-medium">
                        {session.user?.name
                          ? getInitials(session.user.name)
                          : session.user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/profile" })}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
