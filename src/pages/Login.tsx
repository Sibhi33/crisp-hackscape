
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Apple, Chrome } from "lucide-react";

const Login = () => {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 glassmorphism">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        <p className="text-muted-foreground text-center">
          Sign in to continue to Crisp
        </p>
        
        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
          
          <button
            onClick={signInWithApple}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
          >
            <Apple className="w-5 h-5" />
            <span>Continue with Apple</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
