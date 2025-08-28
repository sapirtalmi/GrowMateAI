import React from 'react';
import { motion } from 'framer-motion';
import { Target, Heart, TrendingUp, Users } from 'lucide-react';

const About: React.FC = () => {
  const benefits = [
    {
      icon: Target,
      title: "Precision Care",
      description: "Get exact recommendations based on your specific plants and environmental conditions."
    },
    {
      icon: Heart,
      title: "Plant Health",
      description: "Early detection of issues keeps your plants healthy and thriving."
    },
    {
      icon: TrendingUp,
      title: "Growth Optimization",
      description: "Optimize growing conditions for maximum plant growth and yield."
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Perfect for both gardening hobbyists and professional growers."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="text-primary-600">GrowMateAI</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing gardening by combining cutting-edge AI technology with custom-built 
            ESP32 sensors to create the ultimate smart gardening experience.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left - Story */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-gray-900">
              Smart Gardening Made Simple
            </h3>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Traditional gardening often involves guesswork - when to water, how much light is enough, 
                or why plants aren't thriving. GrowMateAI eliminates this uncertainty by providing 
                real-time, data-driven insights.
              </p>
              
              <p>
                Our custom ESP32-based sensors continuously monitor critical plant parameters like soil 
                moisture, temperature, humidity, and light levels. This data feeds into our AI system, 
                powered by ChatGPT, which analyzes patterns and delivers personalized care recommendations.
              </p>
              
              <p>
                Whether you're a beginner trying to keep your first houseplant alive or a seasoned 
                gardener optimizing crop yields, GrowMateAI adapts to your needs and skill level.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg border-l-4 border-primary-500">
              <h4 className="font-semibold text-primary-900 mb-2">Our Mission</h4>
              <p className="text-primary-800">
                To democratize successful gardening through intelligent technology, making it accessible 
                and enjoyable for everyone while promoting sustainable growing practices.
              </p>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary-100 to-earth-100 rounded-2xl p-8">
              {/* Mockup of the app interface */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-900">My Garden</h5>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-600">85%</div>
                    <div className="text-sm text-gray-600">Soil Moisture</div>
                  </div>
                  <div className="bg-earth-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-earth-600">24°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">AI Recommendation</div>
                  <div className="text-xs text-yellow-700 mt-1">
                    "Your tomato plants are doing well! Consider reducing watering frequency slightly."
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <benefit.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h4>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
