import React from 'react';

const WhyChooseUs = () => {
  const features = [
    {
      title: 'Secure Booking',
      description: 'Your payments and data are completely secure with us',
      icon: '🔒',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Best Prices',
      description: 'Get the best deals and lowest prices guaranteed',
      icon: '💰',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs',
      icon: '🎧',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Easy Booking',
      description: 'Simple and hassle-free booking process',
      icon: '⚡',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose YatraSetu?
          </h2>
          <p className="text-xl text-gray-600">Your trusted travel companion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className={`${feature.iconColor} text-3xl`}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;