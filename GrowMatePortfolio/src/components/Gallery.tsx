import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';

const Gallery: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "Main dashboard showing all your plants and their current status",
      image: "/api/placeholder/400/600",
      category: "Overview"
    },
    {
      title: "Plant Details",
      description: "Detailed view of individual plant with sensor data and AI recommendations",
      image: "/api/placeholder/400/600",
      category: "Details"
    },
    {
      title: "Real-time Monitoring",
      description: "Live sensor data with charts and historical trends",
      image: "/api/placeholder/400/600",
      category: "Monitoring"
    },
    {
      title: "AI Recommendations",
      description: "Personalized care suggestions based on plant analysis",
      image: "/api/placeholder/400/600",
      category: "AI Insights"
    },
    {
      title: "Sensor Management",
      description: "Configure and manage your ESP32 sensors",
      image: "/api/placeholder/400/600",
      category: "Hardware"
    },
    {
      title: "Notification Center",
      description: "All alerts and updates in one convenient location",
      image: "/api/placeholder/400/600",
      category: "Alerts"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            App <span className="text-primary-600">Gallery</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the intuitive interface and powerful features of the GrowMateAI mobile application.
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Screenshot Display */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Phone Frame */}
              <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl mx-auto max-w-sm">
                <div className="bg-white rounded-[1.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-gray-100 h-8 flex items-center justify-between px-4">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-600">9:41</div>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* Screenshot Content */}
                  <div className="aspect-[9/16] bg-gradient-to-br from-primary-50 to-earth-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {screenshots[currentSlide].title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {screenshots[currentSlide].category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {screenshots[currentSlide].category}
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900">
                {screenshots[currentSlide].title}
              </h3>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                {screenshots[currentSlide].description}
              </p>

              {/* Feature List */}
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Intuitive and user-friendly design</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Real-time data visualization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-gray-700">Smart notifications and alerts</span>
                </li>
              </ul>

              <div className="flex space-x-4">
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>View Demo</span>
                </button>
                
                <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>Live Preview</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cross-Platform</h3>
            <p className="text-gray-600">
              Built with React Native for consistent experience across iOS and Android devices.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Responsive Design</h3>
            <p className="text-gray-600">
              Optimized for all screen sizes with adaptive layouts and touch-friendly interactions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Offline Support</h3>
            <p className="text-gray-600">
              View your garden data even without internet connection, with automatic sync when online.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
