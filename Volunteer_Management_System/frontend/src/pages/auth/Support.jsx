import { useState, useEffect } from "react";
import { 
  FaBars, FaTimes, FaChevronDown, FaHeadset, FaFileContract, 
  FaShieldAlt, FaCookie, FaQuestionCircle, FaExclamationTriangle,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt,
  FaEnvelope, FaPhone, FaPaperPlane, FaRocket, FaUsers, FaUserTie,
  FaChartLine, FaCheckCircle, FaClock, FaStar, FaHandsHelping,
  FaArrowRight
} from "react-icons/fa";
import "./Support.css";

const Support = () => {
  const [activeTab, setActiveTab] = useState("helpcenter");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState({});
  const [loading, setLoading] = useState(true); // Loader state

  useEffect(() => {
    // Simulate loading time (2 seconds) - SAME AS LANDING PAGE
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
    e.target.reset();
  };

  const scrollToHome = () => {
    window.location.href = "/";
  };

  const scrollToRoleSection = () => {
    window.location.href = "/#role-section";
  };

  // Loader Component - SAME AS LANDING PAGE
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
    <div className="support-page">
      {/* Floating Particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            width: `${3 + Math.random() * 6}px`,
            height: `${3 + Math.random() * 6}px`,
          }}></div>
        ))}
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <h2 className="logo" onClick={() => scrollToHome()} style={{ cursor: "pointer" }}>
          <img src="/logoimg.png" alt="VolunAI Logo" className="logo-img" />
        </h2>
        
        <ul className="nav-links">
          <li><a onClick={scrollToHome}>Home</a></li>
          <li><a onClick={() => window.location.href = "/#features"}>Features</a></li>
          <li><a onClick={() => window.location.href = "/#howitworks"}>How it Works</a></li>
          <li><a onClick={() => window.location.href = "/#pricing"}>Pricing</a></li>
          <li><a onClick={() => window.location.href = "/#about"}>About</a></li>
          <li><a onClick={() => window.location.href = "/#contact"}>Contact</a></li>
        </ul>

        <button className="nav-btn" onClick={scrollToRoleSection}>
          Get Started 
        </button>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <ul className="mobile-nav-links">
            <li><a onClick={scrollToHome}>Home</a></li>
            <li><a onClick={() => window.location.href = "/#features"}>Features</a></li>
            <li><a onClick={() => window.location.href = "/#howitworks"}>How it Works</a></li>
            <li><a onClick={() => window.location.href = "/#pricing"}>Pricing</a></li>
            <li><a onClick={() => window.location.href = "/#about"}>About</a></li>
            <li><a onClick={() => window.location.href = "/#contact"}>Contact</a></li>
            <li><button className="mobile-nav-btn" onClick={scrollToRoleSection}>Get Started </button></li>
          </ul>
        </div>
      </nav>

      {/* Support Hero */}
      <div className="support-hero">
        <div className="hero-content">
          <h1>Support Center</h1>
          <p>We're here to help you with any questions or concerns</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="support-tabs">
        <button className={`tab-btn ${activeTab === "helpcenter" ? "active" : ""}`} onClick={() => setActiveTab("helpcenter")}>
          <FaHeadset /> Help Center
        </button>
        <button className={`tab-btn ${activeTab === "terms" ? "active" : ""}`} onClick={() => setActiveTab("terms")}>
          <FaFileContract /> Terms of Service
        </button>
        <button className={`tab-btn ${activeTab === "privacy" ? "active" : ""}`} onClick={() => setActiveTab("privacy")}>
          <FaShieldAlt /> Privacy Policy
        </button>
        <button className={`tab-btn ${activeTab === "cookies" ? "active" : ""}`} onClick={() => setActiveTab("cookies")}>
          <FaCookie /> Cookie Policy
        </button>
        <button className={`tab-btn ${activeTab === "faqs" ? "active" : ""}`} onClick={() => setActiveTab("faqs")}>
          <FaQuestionCircle /> FAQs
        </button>
        <button className={`tab-btn ${activeTab === "report" ? "active" : ""}`} onClick={() => setActiveTab("report")}>
          <FaExclamationTriangle /> Report an Issue
        </button>
      </div>

      {/* Support Content */}
      <div className="support-content">
        
        {/* Help Center */}
        <div className={`tab-content ${activeTab === "helpcenter" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaHeadset /> Welcome to VolunAI Help Center</h2>
            <p>Your comprehensive guide to using VolunAI platform effectively. Here's everything you need to know:</p>
            
            <h3><FaRocket /> Getting Started</h3>
            <ul>
              <li><strong>Sign Up:</strong> Create your account as a Volunteer or Organizer</li>
              <li><strong>Complete Profile:</strong> Add your skills, interests, and availability</li>
              <li><strong>Browse Opportunities:</strong> Find volunteering events near you</li>
              <li><strong>Register for Events:</strong> Sign up for events that match your interests</li>
            </ul>

            <h3><FaUsers /> For Volunteers</h3>
            <ul>
              <li><strong>Finding Events:</strong> Use our smart search to filter by category, date, and location</li>
              <li><strong>Earning Badges:</strong> Complete hours to earn achievement badges</li>
              <li><strong>Tracking Hours:</strong> Log your volunteer hours automatically</li>
              <li><strong>Reviews & Ratings:</strong> Get recognized by organizers</li>
            </ul>

            <h3><FaUserTie /> For Organizers</h3>
            <ul>
              <li><strong>Creating Events:</strong> Post volunteer opportunities in minutes</li>
              <li><strong>Managing Volunteers:</strong> Track registrations and attendance</li>
              <li><strong>AI Matching:</strong> Let our AI find the perfect volunteers for you</li>
              <li><strong>Analytics Dashboard:</strong> Track your impact metrics</li>
            </ul>

            <h3><FaHandsHelping /> Need More Help?</h3>
            <p>Contact our support team at <strong style={{color: "#ff7a18"}}>support@volunai.com</strong> or call us at <strong style={{color: "#ff7a18"}}>+1 (234) 567-8900</strong></p>
          </div>
        </div>

        {/* Terms of Service */}
        <div className={`tab-content ${activeTab === "terms" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaFileContract /> Terms of Service</h2>
            <p><em>Last updated: January 1, 2024</em></p>
            
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using VolunAI, you agree to be bound by these Terms of Service. If you disagree with any part, please do not use our platform.</p>

            <h3>2. User Accounts</h3>
            <p>You must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

            <h3>3. User Conduct</h3>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Respect other users and organizers</li>
              <li>Complete volunteering commitments you sign up for</li>
              <li>Not use the platform for any illegal activities</li>
              <li>Not harass, abuse, or harm others</li>
            </ul>

            <h3>4. Event Listings</h3>
            <p>Organizers are responsible for the accuracy of their event listings. VolunAI is not liable for any issues arising from events posted on our platform.</p>

            <h3>5. Intellectual Property</h3>
            <p>All content on VolunAI, including logos, designs, and code, is owned by VolunAI and protected by copyright laws.</p>

            <h3>6. Termination</h3>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.</p>

            <h3>7. Limitation of Liability</h3>
            <p>VolunAI is not liable for any indirect, incidental, or consequential damages arising from your use of our platform.</p>

            <h3>8. Contact Us</h3>
            <p>For questions about these terms, contact us at <strong style={{color: "#ff7a18"}}>legal@volunai.com</strong></p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className={`tab-content ${activeTab === "privacy" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaShieldAlt /> Privacy Policy</h2>
            <p><em>Last updated: January 1, 2024</em></p>
            
            <h3>Information We Collect</h3>
            <ul>
              <li><strong>Personal Information:</strong> Name, email, phone number, location</li>
              <li><strong>Account Data:</strong> Profile information, skills, interests</li>
              <li><strong>Usage Data:</strong> How you interact with our platform</li>
              <li><strong>Volunteering History:</strong> Events you've participated in</li>
            </ul>

            <h3>How We Use Your Information</h3>
            <ul>
              <li>Match you with relevant volunteering opportunities</li>
              <li>Communicate about events and updates</li>
              <li>Improve our AI matching algorithms</li>
              <li>Verify your volunteer hours</li>
              <li>Send important notifications</li>
            </ul>

            <h3>Information Sharing</h3>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul>
              <li>Event organizers when you register for their events</li>
              <li>Service providers who help us operate the platform</li>
              <li>Law enforcement when required by law</li>
            </ul>

            <h3>Your Rights</h3>
            <ul>
              <li>Access and update your personal information</li>
              <li>Delete your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h3>Contact Us</h3>
            <p>Privacy questions? Email us at <strong style={{color: "#ff7a18"}}>privacy@volunai.com</strong></p>
          </div>
        </div>

        {/* Cookie Policy */}
        <div className={`tab-content ${activeTab === "cookies" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaCookie /> Cookie Policy</h2>
            <p><em>Last updated: January 1, 2024</em></p>
            
            <h3>What Are Cookies?</h3>
            <p>Cookies are small text files stored on your device when you visit websites. They help us provide you with a better experience.</p>

            <h3>How We Use Cookies</h3>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the platform to function (login, security)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
              <li><strong>Functional Cookies:</strong> Enable enhanced features like chat and notifications</li>
            </ul>

            <h3>Managing Cookies</h3>
            <p>You can control cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent.</p>

            <h3>Contact Us</h3>
            <p>For questions about our Cookie Policy, contact us at <strong style={{color: "#ff7a18"}}>cookies@volunai.com</strong></p>
          </div>
        </div>

        {/* FAQs */}
        <div className={`tab-content ${activeTab === "faqs" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaQuestionCircle /> Frequently Asked Questions</h2>
            
            <div className={`faq-item ${faqOpen[0] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(0)}>
                <span>How do I create an account?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Click on the "Get Started" button on our homepage, choose your role (Volunteer or Organizer), and fill in your details. It takes less than 2 minutes!
              </div>
            </div>

            <div className={`faq-item ${faqOpen[1] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(1)}>
                <span>Is VolunAI free to use?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Yes! VolunAI is completely free for volunteers. Organizers have free basic plans and paid premium plans with advanced features.
              </div>
            </div>

            <div className={`faq-item ${faqOpen[2] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(2)}>
                <span>How does AI matching work?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Our AI analyzes your skills, interests, and availability to recommend the most relevant volunteering opportunities. It also helps organizers find the best volunteers for their events.
              </div>
            </div>

            <div className={`faq-item ${faqOpen[3] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(3)}>
                <span>Can I change my role from Volunteer to Organizer?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Yes! You can have both roles under one account. Go to your profile settings and add the Organizer role.
              </div>
            </div>

            <div className={`faq-item ${faqOpen[4] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(4)}>
                <span>How do I track my volunteer hours?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Organizers can mark attendance digitally. Your hours are automatically added to your profile. You can also manually log hours for approval.
              </div>
            </div>

            <div className={`faq-item ${faqOpen[5] ? "active" : ""}`}>
              <div className="faq-question" onClick={() => toggleFaq(5)}>
                <span>What if I can't attend an event I signed up for?</span>
                <FaChevronDown className="faq-icon" />
              </div>
              <div className="faq-answer">
                Please cancel at least 24 hours in advance from your dashboard. Frequent no-shows may affect your account standing.
              </div>
            </div>
          </div>
        </div>

        {/* Report an Issue */}
        <div className={`tab-content ${activeTab === "report" ? "active" : ""}`}>
          <div className="content-card">
            <h2><FaExclamationTriangle /> Report an Issue</h2>
            <p>Found a bug or have a problem? Let us know and we'll fix it ASAP!</p>
            
            <form className="report-form" onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label>Your Email *</label>
                <input type="email" required placeholder="Enter your email address" />
              </div>

              <div className="form-group">
                <label>Issue Type *</label>
                <select required>
                  <option value="">Select issue type</option>
                  <option value="bug">Technical Bug</option>
                  <option value="account">Account Issue</option>
                  <option value="payment">Payment/Billing Issue</option>
                  <option value="event">Event Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input type="text" required placeholder="Brief summary of the issue" />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea required placeholder="Please provide detailed information about the issue..."></textarea>
              </div>

              <button type="submit" className="submit-btn">Submit Report</button>
              
              {formSubmitted && (
                <div className="success-message">
                  <FaCheckCircle /> Thank you! Our team will review your report within 24 hours.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3 className="logo">
              <img src="/logoimg.png" alt="logo" className="logo-img" />
            </h3>
            <p>AI-powered platform connecting volunteers with meaningful opportunities and helping organizers manage events effortlessly.</p>
            <div className="social-links">
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaLinkedinIn /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a onClick={scrollToHome}>Home</a></li>
              <li><a onClick={() => window.location.href = "/#features"}>Features</a></li>
              <li><a onClick={() => window.location.href = "/#howitworks"}>How it Works</a></li>
              <li><a onClick={() => window.location.href = "/#pricing"}>Pricing</a></li>
              <li><a onClick={() => window.location.href = "/#about"}>About</a></li>
              <li><a onClick={() => window.location.href = "/#contact"}>Contact</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a onClick={() => setActiveTab("helpcenter")}>Help Center</a></li>
              <li><a onClick={() => setActiveTab("terms")}>Terms of Service</a></li>
              <li><a onClick={() => setActiveTab("privacy")}>Privacy Policy</a></li>
              <li><a onClick={() => setActiveTab("cookies")}>Cookie Policy</a></li>
              <li><a onClick={() => setActiveTab("faqs")}>FAQs</a></li>
              <li><a onClick={() => setActiveTab("report")}>Report an Issue</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Get in Touch</h4>
            <ul className="contact-info">
              <li><FaMapMarkerAlt /> 123 Volunteer St, NY 10001</li>
              <li><FaEnvelope /> <a href="mailto:hello@volunai.com">hello@volunai.com</a></li>
              <li><FaPhone /> <a href="tel:+1234567890">+1 (234) 567-890</a></li>
            </ul>
            <div className="newsletter">
              <p>Subscribe for updates</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email" className="newsletter-input" />
                <button className="newsletter-btn"><FaPaperPlane /> Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 VolunAI. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a onClick={() => setActiveTab("privacy")}>Privacy Policy</a>
            <a onClick={() => setActiveTab("terms")}>Terms of Service</a>
            <a onClick={() => setActiveTab("cookies")}>Cookies Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;