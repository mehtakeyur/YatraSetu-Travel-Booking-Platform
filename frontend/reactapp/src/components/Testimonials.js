import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      initial: 'R',
      bgColor: 'bg-blue-600',
      review: 'Amazing service! Booked my family vacation to Goa and everything was perfect. Highly recommended!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      initial: 'P',
      bgColor: 'bg-green-600',
      review: 'Best prices and excellent customer service. My go-to platform for all travel bookings!',
      rating: 5
    },
    {
      name: 'Amit Patel',
      initial: 'A',
      bgColor: 'bg-purple-600',
      review: 'Seamless booking experience. The website is user-friendly and the deals are unbeatable!',
      rating: 5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600">Real reviews from real travelers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center text-white font-semibold`}>
                  {testimonial.initial}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;