import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RecruiterLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      console.log("Recruiter Login Data:", data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-md">Email</h1>
          <input
            type="email"
            placeholder="Enter your email"
            className={`input bg-background w-full max-w-xs h-12 ${errors.email ? 'border-red' : ''
              }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && (
            <p className="text-red text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2 relative">
          <h1 className="text-md">Password</h1>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your Password"
            className={`input bg-background w-full max-w-xs h-12 pr-12 ${errors.password ? 'border-red' : ''
              }`}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
          />
          <button
            type="button"
            className="absolute top-10 right-4 text-muted transition-all duration-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {errors.password && (
            <p className="text-red text-sm">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        className={`btn btn-primary text-sm font-semibold text-white w-full ${isLoading ? 'loading' : ''
          }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex gap-2 items-center">
            {/* Animated Text */}
            <h1 className="text-lg text-red font-medium">Connecting</h1>

            {/* Animated Dots */}
            <div className="flex gap-2 mt-1">
              <span className="w-1 h-1 bg-red rounded-full animate-bounce [animation-delay:-0.4s]"></span>
              <span className="w-1 h-1 bg-red rounded-full animate-bounce [animation-delay:-0.2s]"></span>
              <span className="w-1 h-1 bg-red rounded-full animate-bounce"></span>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <h1 className="text-lg font-medium">Log In</h1>
          </div>
        )}
      </button>
    </form>
  );
};

export default RecruiterLoginForm;