import React from "react";
import GradientBackground from "./GradientBackground";
import { BrandLogo } from "../BrandLogo";

const AuthLayout = ({
  children,
  leftPanel,
  variant = "split",
  backgroundVariant = "default",
}) => {
  if (variant === "center") {
    return (
      <GradientBackground variant={backgroundVariant}>
        <div className="flex flex-col items-center justify-center px-4 py-12">
          {children}
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant={backgroundVariant}>
      <div className="flex min-h-screen">
        {/* Left Panel - Value Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
          <div className="relative z-10">
            <BrandLogo className="w-40" />
          </div>

          <div className="relative z-10 max-w-lg">
            {leftPanel || (
              <>
                <h1 className="text-5xl font-bold text-white tracking-tight mb-6">
                  Build Smarter{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    AI Strategies
                  </span>
                </h1>
                <p className="text-gray-400 text-lg mb-12">
                  The OS for modern content teams. Plan, execute, and scale with
                  intelligence.
                </p>

                <div className="space-y-6">
                  {[
                    "AI Persona Analysis",
                    "Industry Benchmarking",
                    "30-Day Growth Blueprint",
                    "ROI Intelligence",
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 text-gray-300"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-gray-950 bg-gray-800"
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Joined by <span className="text-white font-bold">2,500+</span>{" "}
              strategies
            </p>
          </div>

          {/* Abstract backgrounds for left panel */}
          <div className="absolute top-[20%] right-[-10%] w-[80%] h-[60%] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Right Panel - Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 flex justify-center">
              <BrandLogo className="w-32" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </GradientBackground>
  );
};

export default AuthLayout;
