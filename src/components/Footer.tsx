import React from 'react'
import { Link } from 'react-router-dom'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-900 border-t border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-white">RoboTech</span>
            </div>
            <p className="text-primary-300 text-sm">
              Your premier destination for cutting-edge robotics equipment and components. 
              Building the future, one robot at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-primary-400 hover:text-accent-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-primary-300 hover:text-white transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=sensors" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Sensors
                </Link>
              </li>
              <li>
                <Link to="/products?category=actuators" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Actuators
                </Link>
              </li>
              <li>
                <Link to="/products?category=controllers" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Controllers
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-300 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-300 hover:text-white transition-colors text-sm">
                  Technical Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-accent-500 mt-0.5 flex-shrink-0" />
                <div className="text-primary-300 text-sm">
                  <p>123 Robotics Avenue</p>
                  <p>Tech City, TC 12345</p>
                  <p>United States</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-accent-500 flex-shrink-0" />
                <span className="text-primary-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-accent-500 flex-shrink-0" />
                <span className="text-primary-300 text-sm">support@robotech.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-primary-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-primary-300 text-sm">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-accent-500" />
              <span>for robotics enthusiasts</span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-primary-300 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center text-primary-400 text-sm">
            <p>&copy; 2025 RoboTech. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer