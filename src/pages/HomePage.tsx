import { Link } from 'react-router-dom';
import { CalendarCheck, Settings, Shield, Smartphone, Clock, Palette, Phone } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Smart Booking for Nail Salons in Jordan
              </h1>
              <p className="mt-4 text-lg text-primary-light">
                Streamline your salon operations with online bookings, 
                appointment management, and powerful admin tools.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Contact Sales
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Nail salon services" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* What We Do Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What We Do</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Gentivo provides an all-in-one solution for nail salons to manage bookings,
              clients, and grow their business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="p-2 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Online Bookings</h3>
              <p className="text-gray-600">
                Allow clients to book appointments 24/7 through a customized booking page.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="p-2 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Management</h3>
              <p className="text-gray-600">
                Efficiently manage all your appointments with our intuitive admin dashboard.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="p-2 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Salon Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive admin panel to manage appointments, services, and clients.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="p-2 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Branding</h3>
              <p className="text-gray-600">
                Personalize your booking experience with your salon's unique branding and colors.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Gentivo</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Designed specifically for nail salons in Jordan, with features that matter to you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <Smartphone className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile-Friendly Design</h3>
              <p className="text-gray-600">
                Beautiful, responsive interfaces that work perfectly on all devices, especially mobile.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <Clock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Availability</h3>
              <p className="text-gray-600">
                Show real-time availability to prevent double bookings and optimize your schedule.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Built with security in mind, ensuring your salon and customer data is always protected.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Sales Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Contact Sales</h2>
            <p className="mt-4 text-xl text-gray-600">
              Get in touch with our team to learn how Gentivo can help your salon grow.
            </p>
            <div className="mt-8">
              <a 
                href="tel:0798104962"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Us: 079 810 4962
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}