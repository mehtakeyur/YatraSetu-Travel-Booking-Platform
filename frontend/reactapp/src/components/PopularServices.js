import React from 'react';
import { Link } from 'react-router-dom';

const PopularServices = () => {
  const services = [
    {
      title: 'Flights',
      description: 'Book domestic flights',
      gradient: 'from-blue-500 to-blue-700',
      icon: '✈️',
      link: '/?tab=flights'
    },
    {
      title: 'Hotels',
      description: 'Find comfortable stays at the best rates',
      gradient: 'from-green-500 to-green-700',
      icon: '🏨',
      link: '/?tab=hotels'
    },
    {
      title: 'Trains',
      description: 'Search and book train tickets easily',
      gradient: 'from-yellow-500 to-yellow-700',
      icon: '🚂',
      link: '/?tab=trains'
    },
    {
      title: 'Buses',
      description: 'Book intercity and state buses with ease',
      gradient: 'from-purple-500 to-purple-700',
      icon: '🚌',
      link: '/?tab=buses'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Services
          </h2>
          <p className="text-xl text-gray-600">Quickly access what you need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.link}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`h-48 bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                <span className="text-6xl">{service.icon}</span>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularServices;