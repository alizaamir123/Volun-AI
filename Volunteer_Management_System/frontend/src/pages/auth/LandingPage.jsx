import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, FaUserTie, FaChartLine, FaBars, FaTimes, 
  FaBrain, FaCalendarCheck, FaShieldAlt, FaComments, 
  FaMobileAlt, FaArrowRight, FaClock, FaChevronLeft, FaChevronRight,
  FaRocket, FaGlobe, FaTrophy, FaHeart, FaUserPlus, FaSearch, FaHandsHelping,
  FaQuoteLeft
} from "react-icons/fa";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true); // Loader state

  // Initialize AOS for scroll animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      once: false,
      easing: "ease-in-out"
    });
  }, []);

  // Features data for slider
  const features = [
    {
      icon: <FaBrain />,
      title: "AI-Powered Matching",
      description: "Smart algorithm matches volunteers with perfect opportunities"
    },
    {
      icon: <FaChartLine />,
      title: "Real-time Analytics",
      description: "Track impact metrics and volunteer hours"
    },
    {
      icon: <FaCalendarCheck />,
      title: "Smart Scheduling",
      description: "Automated reminders and calendar integration"
    },
    {
      icon: <FaShieldAlt />,
      title: "Verified Badges",
      description: "Earn recognition for your contributions"
    },
    {
      icon: <FaComments />,
      title: "In-app Messaging",
      description: "Direct communication with organizers"
    },
    {
      icon: <FaMobileAlt />,
      title: "Mobile Friendly",
      description: "Access from any device anywhere"
    }
  ];

  const itemsPerPage = 2;
  const totalSlides = Math.ceil(features.length / itemsPerPage);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Simulate loading time (2 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Counting animation
  useEffect(() => {
    if (!loading) {
      let start = 0;
      const end = 10000;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [loading]);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const handleSelect = (role) => {
    localStorage.setItem("selectedRole", role);

    if (role === "Volunteer") {
      navigate("/volunteer-signup");
    } else if (role === "Organizer") {
      navigate("/organizer-signup");
    }
  };

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Loader Component
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-wrapper">
          <div className="loader-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="loader-logo">
            <img src="/logoimg.png" alt="VolunAI" />
          </div>
          <h2 className="loader-title">VolunAI</h2>
          <p className="loader-subtitle">Empowering Communities</p>
          <div className="loader-progress">
            <div className="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing">

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`,
          }}></div>
        ))}
      </div>

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h2 className="logo" onClick={() => scrollToSection("home")} style={{ cursor: "pointer" }}>
          <img src="/logoimg.png" alt="VolunAI Logo" className="logo-img" />
        </h2>

        <ul className="nav-links">
          <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}>Home</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>Features</a></li>
          <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); scrollToSection("howitworks"); }}>How it Works</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection("pricing"); }}>Pricing</a></li>
          <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>About</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>Contact</a></li>
        </ul>

        <button className="nav-btn" onClick={() => navigate('/login')}>
          Get Started
        </button>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <ul className="mobile-nav-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}>Home</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection("features"); }}>Features</a></li>
            <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); scrollToSection("howitworks"); }}>How it Works</a></li>
            <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection("pricing"); }}>Pricing</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>About</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection("contact"); }}>Contact</a></li>
            <li><button className="mobile-nav-btn" onClick={() => scrollToSection("role-section")}>Get Started</button></li>
          </ul>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home" data-aos="fade-in">
        <div className="overlay"></div>
        <div className="hero-inner">
          <div className="hero-left" data-aos="fade-right" data-aos-delay="200">
            <div className="hero-badge">
              <FaRocket /> Join the Movement
            </div>
            <h1>
              Together We Can <br />
              <span className="highlight">Create Positive Change</span> <br />
              In The World.
            </h1>
            <p>
              AI-powered platform that connects volunteers with meaningful
              opportunities and helps organizers manage events effortlessly.
            </p>
            <div className="hero-buttons">
              <button className="hero-btn hero-btn-primary" onClick={() => scrollToSection("role-section")}>
                <FaArrowRight /> Explore
              </button>
              <button className="hero-btn hero-btn-outline" onClick={() => scrollToSection("howitworks")}>
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-right" data-aos="fade-left" data-aos-delay="300">
            <div className="stats-circle">
              <FaChartLine size={35} />
              <div className="stats-number">{count.toLocaleString()}+</div>
              <div className="stats-label">Active Volunteers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLE CARDS SECTION - SELECT YOUR ROLE */}
      <section id="role-section" className="role-section" data-aos="fade-up">
        <div className="role-container">
          <div className="role-header">
            <span className="role-badge">Select Your Path</span>
            <h2>Choose Your <span>Role</span></h2>
            <p>Whether you want to volunteer or organize events, we have the perfect place for you</p>
          </div>

          <div className="role-cards-wrapper">
            <div className="role-card-single" data-aos="flip-left" data-aos-delay="100">
              <div className="role-card-icon">
                <FaUsers />
              </div>
              <h3>Volunteer</h3>
              <p>Join meaningful causes, contribute your skills, and make a real difference in communities worldwide.</p>
              <div className="role-features">
                <span>✓ Find Opportunities</span>
                <span>✓ Track Your Impact</span>
                <span>✓ Earn Recognition Badges</span>
              </div>
              <button className="role-btn role-btn-volunteer" onClick={() => handleSelect("Volunteer")}>
                Join as Volunteer <FaArrowRight />
              </button>
            </div>

            <div className="role-card-single" data-aos="flip-right" data-aos-delay="200">
              <div className="role-card-icon">
                <FaUserTie />
              </div>
              <h3>Organizer</h3>
              <p>Create events, manage volunteers, and amplify your organization's impact with smart tools.</p>
              <div className="role-features">
                <span>✓ Create & Manage Events</span>
                <span>✓ Smart Volunteer Management</span>
                <span>✓ Real-time Analytics</span>
              </div>
              <button className="role-btn role-btn-organizer" onClick={() => handleSelect("Organizer")}>
                Become Organizer <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section" data-aos="fade-up">
        <div className="features-container">
          <div className="features-image-wrapper" data-aos="fade-right" data-aos-delay="100">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
              alt="Volunteers working together" 
              className="main-image"
            />
            
            <div className="floating-card card-1" data-aos="zoom-in" data-aos-delay="200">
              <FaUsers />
              <div className="card-content">
                <h4>5000+ Volunteers</h4>
                <p>Active & Growing</p>
              </div>
            </div>
            
            <div className="floating-card card-2" data-aos="zoom-in" data-aos-delay="300">
              <FaChartLine />
              <div className="card-content">
                <h4>98% Satisfaction</h4>
                <p>Positive Feedback</p>
              </div>
            </div>
            
            <div className="floating-card card-3" data-aos="zoom-in" data-aos-delay="400">
              <FaGlobe />
              <div className="card-content">
                <h4>50+ Countries</h4>
                <p>Global Reach</p>
              </div>
            </div>
            
            <div className="floating-card card-4" data-aos="zoom-in" data-aos-delay="500">
              <FaTrophy />
              <div className="card-content">
                <h4>Award Winner</h4>
                <p>Best Platform 2024</p>
              </div>
            </div>
          </div>

          <div className="features-content" data-aos="fade-left" data-aos-delay="100">
            <div className="section-badge">Why Choose Us</div>
            <h2>
              Smart Features to <span>Empower</span> Your<br />
              Volunteering Journey
            </h2>
            
            <div className="text-overlay-card">
              <FaHeart />
              <p>Trusted by thousands of volunteers worldwide</p>
            </div>

            <div className="features-slider-container">
              <div className="features-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="slide-group">
                    {features.slice(slideIndex * itemsPerPage, slideIndex * itemsPerPage + itemsPerPage).map((feature, idx) => (
                      <div key={idx} className="feature-slide">
                        <div className="feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="slider-controls">
              <button className="slider-btn" onClick={prevSlide}><FaChevronLeft /></button>
              <div className="slider-dots">
                {[...Array(totalSlides)].map((_, index) => (
                  <div
                    key={index}
                    className={`slider-dot ${currentSlide === index ? "active" : ""}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
              <button className="slider-btn" onClick={nextSlide}><FaChevronRight /></button>
            </div>

            <button className="features-cta" onClick={() => scrollToSection("role-section")}>
              Get Started Now <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="howitworks" className="how-it-works" data-aos="fade-up">
        <div className="how-container">
          <div className="how-header" data-aos="fade-up">
            <span className="how-badge">How It Works</span>
            <h2>Get Started in <span>4 Simple Steps</span></h2>
            <p>From sign up to making an impact - we've made it easy for you</p>
          </div>

          <div className="steps-wrapper">
            <div className="step" data-aos="fade-up" data-aos-delay="100">
              <div className="step-num">01</div>
              <div className="step-icon"><FaUserPlus /></div>
              <h3>Create Account</h3>
              <p>Sign up as volunteer or organizer in just 2 minutes</p>
            </div>

            <div className="step" data-aos="fade-up" data-aos-delay="200">
              <div className="step-num">02</div>
              <div className="step-icon"><FaSearch /></div>
              <h3>Find Opportunities</h3>
              <p>AI matches you with perfect volunteering opportunities</p>
            </div>

            <div className="step" data-aos="fade-up" data-aos-delay="300">
              <div className="step-num">03</div>
              <div className="step-icon"><FaHandsHelping /></div>
              <h3>Join & Contribute</h3>
              <p>Apply to events and start making real difference</p>
            </div>

            <div className="step" data-aos="fade-up" data-aos-delay="400">
              <div className="step-num">04</div>
              <div className="step-icon"><FaChartLine /></div>
              <h3>Track Impact</h3>
              <p>See your impact metrics and earn recognition badges</p>
            </div>
          </div>

          <button className="how-cta" data-aos="zoom-in" data-aos-delay="500" onClick={() => scrollToSection("home")}>
            Start Your Journey <FaArrowRight />
          </button>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="pricing-section" data-aos="fade-up">
        <div className="pricing-container">
          <div className="pricing-header" data-aos="fade-up">
            <span className="pricing-badge">Pricing Plans</span>
            <h2>Choose the <span>Perfect Plan</span> for You</h2>
            <p>Simple, transparent pricing. No hidden fees. Cancel anytime.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card" data-aos="flip-left" data-aos-delay="100">
              <div className="pricing-card-header">
                <h3>Basic</h3>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
                <p>Perfect for getting started</p>
              </div>

              <div className="pricing-features">
                <div className="feature"><i className="fas fa-check"></i><span>Up to 50 volunteer hours/month</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Basic AI matching</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Email support</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Community access</span></div>
                <div className="feature disabled"><i className="fas fa-times"></i><span>Advanced analytics</span></div>
                <div className="feature disabled"><i className="fas fa-times"></i><span>Priority support</span></div>
              </div>
              <button className="pricing-btn pricing-btn-outline">Get Started</button>
            </div>

            <div className="pricing-card popular" data-aos="flip-up" data-aos-delay="200">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-card-header">
                <h3>Pro</h3>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/month</span>
                </div>
                <p>Best for growing organizations</p>
              </div>
              <div className="pricing-features">
                <div className="feature"><i className="fas fa-check"></i><span>Unlimited volunteer hours</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Advanced AI matching</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Priority email & chat support</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Real-time analytics dashboard</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Custom event branding</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>API access</span></div>
              </div>
              <button className="pricing-btn pricing-btn-primary">Get Started</button>
            </div>

            <div className="pricing-card" data-aos="flip-right" data-aos-delay="300">
              <div className="pricing-card-header">
                <h3>Enterprise</h3>
                <div className="pricing-price">
                  <span className="currency">$</span>
                  <span className="amount">99</span>
                  <span className="period">/month</span>
                </div>
                <p>For large scale organizations</p>
              </div>
              <div className="pricing-features">
                <div className="feature"><i className="fas fa-check"></i><span>Everything in Pro</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Dedicated account manager</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>24/7 phone support</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Custom integrations</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>SSO & advanced security</span></div>
                <div className="feature"><i className="fas fa-check"></i><span>Training & onboarding</span></div>
              </div>
              <button className="pricing-btn pricing-btn-outline">Contact Sales</button>
            </div>
          </div>

          <div className="pricing-trusted" data-aos="fade-up" data-aos-delay="400">
            <p>Trusted by 1000+ organizations worldwide</p>
            <div className="trusted-icons">
              <i className="fab fa-google"></i>
              <i className="fab fa-microsoft"></i>
              <i className="fab fa-amazon"></i>
              <i className="fab fa-salesforce"></i>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="about-us" data-aos="fade-up">
        <div className="about-bg"></div>
        
        <div className="about-container">
          <div className="about-row">
            <div className="about-content" data-aos="fade-right" data-aos-delay="100">
              <span className="about-badge">
                <FaHeart /> Who We Are
              </span>
              <h2>
                Making the World a Better Place Through <span>Volunteering</span>
              </h2>
              <p className="about-desc">
                VolunAI is an AI-powered platform that connects passionate volunteers 
                with meaningful opportunities while helping organizers manage events 
                effortlessly. Founded in 2023, we've grown into a global community 
                of changemakers.
              </p>
              
              <div className="about-features">
                <div className="about-feature"><div className="feature-dot"></div><span>AI-Powered Matching System</span></div>
                <div className="about-feature"><div className="feature-dot"></div><span>Real-time Impact Tracking</span></div>
                <div className="about-feature"><div className="feature-dot"></div><span>Global Community Network</span></div>
              </div>
              
              <div className="about-stats">
                <div className="stat-item"><h4>10,000+</h4><p>Volunteers</p></div>
                <div className="stat-item"><h4>50+</h4><p>Countries</p></div>
                <div className="stat-item"><h4>500+</h4><p>Events</p></div>
                <div className="stat-item"><h4>98%</h4><p>Satisfaction</p></div>
              </div>
              
              <button className="about-cta" onClick={() => scrollToSection("home")}>
                Become a Volunteer <FaArrowRight />
              </button>
            </div>
            
            <div className="about-quote" data-aos="fade-left" data-aos-delay="200">
              <div className="quote-card">
                <FaQuoteLeft className="quote-icon" />
                <p>Volunteering is the ultimate exercise in democracy. You vote in elections once a year, but when you volunteer, you vote every day about the kind of community you want to live in.</p>
                <div className="quote-author">
                  <div className="author-line"></div>
                  <div><h5>- Unknown Author</h5></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section" data-aos="fade-up">
        <div className="contact-container">
          <div className="contact-header" data-aos="fade-up">
            <span className="contact-badge">Get In Touch</span>
            <h2>Let's Talk About <span>Your Ideas</span></h2>
            <p>Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
          </div>

          <div className="contact-grid">
            <div className="contact-info-wrapper" data-aos="fade-right" data-aos-delay="100">
              <div className="contact-single-card">
                <div className="contact-image">
                  <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop" alt="Contact Us" />
                  <div className="image-overlay-contact">
                    <i className="fas fa-headset"></i>
                    <p>24/7 Support Available</p>
                  </div>
                </div>
                <div className="contact-details">
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <div className="contact-detail-text">
                      <h4>Visit Us</h4>
                      <p>123 Volunteer Street, New York, NY 10001, United States</p>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-phone-alt"></i></div>
                    <div className="contact-detail-text">
                      <h4>Call Us</h4>
                      <p>+1 (234) 567-8900</p>
                      <span className="contact-time">Mon-Fri, 9am to 6pm</span>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-envelope"></i></div>
                    <div className="contact-detail-text">
                      <h4>Email Us</h4>
                      <p>hello@volunai.com</p>
                      <p>support@volunai.com</p>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-share-alt"></i></div>
                    <div className="contact-detail-text">
                      <h4>Follow Us</h4>
                      <div className="contact-single-social">
                        <a href="#" className="contact-single-social-icon"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="contact-single-social-icon"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="contact-single-social-icon"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="contact-single-social-icon"><i className="fab fa-linkedin-in"></i></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper" data-aos="fade-left" data-aos-delay="200">
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" placeholder="How can we help?" />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows="3" placeholder="Tell us about your project..."></textarea>
                </div>
                <button type="submit" className="contact-submit">
                  Send Message <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" data-aos="fade-up">
        <div className="footer-container">
          <div className="footer-brand">
            <h3 className="logo">
              <img src="/logoimg.png" alt="logo" className="logo-img" />
            </h3>
            <p>AI-powered platform connecting volunteers with meaningful opportunities and helping organizers manage events effortlessly.</p>
            <div className="social-links">
              <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a onClick={() => scrollToSection("home")}>Home</a></li>
              <li><a onClick={() => scrollToSection("features")}>Features</a></li>
              <li><a onClick={() => scrollToSection("howitworks")}>How it Works</a></li>
              <li><a onClick={() => scrollToSection("pricing")}>Pricing</a></li>
              <li><a onClick={() => scrollToSection("about")}>About Us</a></li>
              <li><a onClick={() => scrollToSection("contact")}>Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="/support">Help Center</a></li>
              <li><a href="/support">Terms of Service</a></li>
              <li><a href="/support">Privacy Policy</a></li>
              <li><a href="/support">Cookie Policy</a></li>
              <li><a href="/support">FAQs</a></li>
              <li><a href="/support">Report an Issue</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Get in Touch</h4>
            <ul className="contact-info">
              <li><i className="fas fa-map-marker-alt"></i> 123 Volunteer St, NY 10001</li>
              <li><i className="fas fa-envelope"></i> <a href="mailto:hello@volunai.com">hello@volunai.com</a></li>
              <li><i className="fas fa-phone"></i> <a href="tel:+1234567890">+1 (234) 567-890</a></li>
            </ul>
            <div className="newsletter">
              <p>Subscribe to our newsletter for updates</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" className="newsletter-input" />
                <button className="newsletter-btn">Subscribe <i className="fas fa-paper-plane"></i></button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 VolunAI. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;