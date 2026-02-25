import React, { useState, useEffect } from "react";

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    setCriteria(checks);

    const score = Object.values(checks).filter(Boolean).length;
    setStrength(score);
  }, [password]);

  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Absolute"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-tighter font-bold">
        <span className="text-gray-500">Security</span>
        <span
          className={
            strengthColors[strength - 1]?.replace("bg-", "text-") ||
            "text-gray-500"
          }
        >
          {strengthLabels[strength - 1]}
        </span>
      </div>

      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full flex-1 transition-all duration-500 rounded-full ${
              level <= strength ? strengthColors[strength - 1] : "bg-white/5"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
