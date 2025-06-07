import { Link } from 'react-router-dom';
import { CalendarCheck, Settings, Shield, Smartphone, Clock, Palette, Phone, Star, Users, CheckCircle, ArrowRight, Sparkles, Zap, Heart, Award, TrendingUp, Globe } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Footer from '../components/common/Footer';
import Logo from '../components/common/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar transparent />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-100/40 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-slate-100/40 rounded-full blur-3xl transform translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Gentivo Logo */}
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <Logo width={120} height={120} />
              </div>
            </div>
            
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-stone-50 border border-stone-200/60 text-stone-600 text-sm font-medium mb-12">
              <Award className="w-4 h-4 mr-2 text-stone-500" />
              Trusted by the Premium Salons in Jordan
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-stone-900 leading-tight mb-8">
              Effortless Booking
              <span className="block font-normal text-stone-700">
                for Modern Salons
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Streamline your salon operations with intelligent booking management. 
              Designed for professionals who value <em className="text-stone-800 font-medium not-italic">simplicity</em> and <em className="text-stone-800 font-medium not-italic">elegance</em>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a 
                href="tel:0798104962"
                className="group px-8 py-4 bg-stone-900 text-white rounded-lg font-medium text-base hover:bg-stone-800 transition-all duration-200 flex items-center focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                aria-label="Call Gentivo sales team"
              >
                <Phone className="w-4 h-4 mr-3" />
                079 810 4962
              </a>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-stone-600 text-sm font-medium mb-2">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Free consultation call
                </div>
                <div className="text-stone-500 text-xs font-light">
                  We'll walk you through setup and answer your questions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-stone-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-6">
              Everything You Need,
              <span className="block font-normal text-stone-700">Nothing You Don't</span>
            </h2>
            <p className="text-lg text-stone-600 font-light leading-relaxed">
              Carefully crafted features that salon professionals actually use, 
              designed with your workflow in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: CalendarCheck,
                title: "Smart Scheduling",
                description: "Intelligent booking system with real-time availability and conflict prevention."
              },
              {
                icon: Smartphone,
                title: "Mobile Excellence",
                description: "Flawless experience across all devices, optimized for the way your clients browse."
              },
              {
                icon: Settings,
                title: "Intuitive Dashboard",
                description: "Clean, organized admin panel that makes management feel effortless."
              },
              {
                icon: Palette,
                title: "Brand Integration",
                description: "Seamlessly incorporate your salon's unique style and personality."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-xl p-8 hover:shadow-lg transition-all duration-300 border border-stone-200/40 hover:border-stone-300/60"
              >
                <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-stone-200 transition-colors duration-200">
                  <feature.icon className="w-6 h-6 text-stone-600" />
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-3">{feature.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-6">
                Why Salon Owners
                <span className="block font-normal text-stone-700">Choose Gentivo</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                {
                  icon: TrendingUp,
                  title: "Increased Bookings",
                  description: "Average 35% increase in appointments within the first month of implementation.",
                  metric: "+35%"
                },
                {
                  icon: Clock,
                  title: "Time Savings",
                  description: "Reduce administrative tasks by up to 4 hours per week with automated workflows.",
                  metric: "4hrs/week"
                },
                {
                  icon: Globe,
                  title: "24/7 Availability",
                  description: "Capture bookings around the clock, even when your salon is closed.",
                  metric: "Always On"
                }
              ].map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-stone-200 transition-colors duration-200">
                      <benefit.icon className="w-8 h-8 text-stone-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-stone-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {benefit.metric}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-stone-900 mb-4">{benefit.title}</h3>
                  <p className="text-stone-600 leading-relaxed font-light max-w-sm mx-auto">{benefit.description}</p>
                </div>
              ))}
            </div>
            
            {/* Setup & Support Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 max-w-4xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "15-min Setup & No Fees",
                  description: "Quick guided setup with transparent pricing. What you see is what you pay - no hidden costs.",
                  metric: "No setup fees"
                },
                {
                  icon: Users,
                  title: "Personal Support",
                  description: "Real humans, real help, real fast. We're here whenever you need us, day or night.",
                  metric: "Real humans"
                }
              ].map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-stone-200 transition-colors duration-200">
                      <benefit.icon className="w-8 h-8 text-stone-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-stone-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {benefit.metric}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-stone-900 mb-4">{benefit.title}</h3>
                  <p className="text-stone-600 leading-relaxed font-light max-w-sm mx-auto">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-stone-600 mb-12 font-light leading-relaxed">
              Join successful salons across Jordan. 
              Experience the difference professional booking management makes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a 
                href="tel:0798104962"
                className="group px-8 py-4 bg-stone-900 text-white rounded-lg font-medium text-base hover:bg-stone-800 transition-all duration-200 flex items-center focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                aria-label="Call Gentivo sales team"
              >
                <Phone className="w-4 h-4 mr-3" />
                079 810 4962
              </a>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-stone-600 text-sm font-medium mb-2">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                  Free consultation call
                </div>
                <div className="text-stone-500 text-xs font-light">
                  We'll walk you through setup and answer your questions
                </div>
              </div>
            </div>
            
            {/* Subtle Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-stone-400 text-xs font-light border-t border-stone-200/40 pt-6">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1.5" />
                Secure & compliant
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1.5" />
                Used by salons nationwide
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                30 day free trial
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}