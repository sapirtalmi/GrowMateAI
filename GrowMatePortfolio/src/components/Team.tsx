import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin, Calendar } from 'lucide-react';

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Full Stack Developer & Project Lead",
      bio: "Passionate about IoT and sustainable technology. Led the development of the GrowMateAI platform from concept to deployment.",
      image: "/api/placeholder/300/300",
      skills: ["React Native", "Azure Functions", "IoT", "MongoDB"],
      social: {
        github: "https://github.com/alexjohnson",
        linkedin: "https://linkedin.com/in/alexjohnson",
        email: "alex@growmateai.com"
      },
      location: "Tel Aviv, Israel",
      joined: "January 2024"
    },
    {
      name: "Sarah Chen",
      role: "AI/ML Engineer",
      bio: "Specialized in plant biology AI and machine learning. Developed the intelligent recommendation system using ChatGPT API.",
      image: "/api/placeholder/300/300",
      skills: ["Python", "TensorFlow", "ChatGPT API", "Data Science"],
      social: {
        github: "https://github.com/sarahchen",
        linkedin: "https://linkedin.com/in/sarahchen",
        email: "sarah@growmateai.com"
      },
      location: "Tel Aviv, Israel",
      joined: "February 2024"
    },
    {
      name: "Mike Rodriguez",
      role: "Hardware Engineer",
      bio: "Expert in ESP32 development and sensor integration. Designed and built the custom sensor network for real-time monitoring.",
      image: "/api/placeholder/300/300",
      skills: ["ESP32", "Arduino", "Circuit Design", "Embedded Systems"],
      social: {
        github: "https://github.com/mikerodriguez",
        linkedin: "https://linkedin.com/in/mikerodriguez",
        email: "mike@growmateai.com"
      },
      location: "Tel Aviv, Israel",
      joined: "March 2024"
    }
  ];

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-primary-600">Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The passionate developers and engineers behind GrowMateAI, bringing together expertise 
            in mobile development, AI, and IoT to revolutionize smart gardening.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200 group"
            >
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-earth-400 rounded-full mx-auto flex items-center justify-center">
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="absolute bottom-2 right-1/2 transform translate-x-1/2 translate-y-1/2">
                  <div className="w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 font-medium">{member.role}</p>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>

                {/* Skills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {member.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {member.joined}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3 pt-4">
                  <a
                    href={member.social.github}
                    className="w-8 h-8 bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href={member.social.linkedin}
                    className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${member.social.email}`}
                    className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-50 to-earth-50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Project Timeline</h3>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">3</div>
              <div className="text-gray-600">Months Development</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">5000+</div>
              <div className="text-gray-600">Lines of Code</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">15+</div>
              <div className="text-gray-600">Features Implemented</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Team Collaboration</div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Want to Join Our Mission?</h3>
          <p className="text-gray-600 mb-6">
            We're always looking for passionate developers and contributors to help make smart gardening accessible to everyone.
          </p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            Get in Touch
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Team;
