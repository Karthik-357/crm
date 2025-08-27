import React from 'react';

const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I create a new project?',
      answer: 'To create a new project, navigate to the Projects page and click the "New Project" button. Fill in the required information and click "Create" to get started.',
    },
    {
      question: 'How can I manage my tasks?',
      answer: 'You can manage your tasks from the Tasks page. Here you can create new tasks, mark them as complete, and set due dates. Tasks can be organized by priority and status.',
    },
    {
      question: 'How do I add team members to a project?',
      answer: 'To add team members, go to the project details page and click on the "Team" tab. From there, you can invite new members by entering their email addresses.',
    },
    {
      question: 'Can I customize the dashboard?',
      answer: 'Yes, the dashboard is fully customizable. Click the settings icon in the top right corner of the dashboard to modify widgets, layout, and displayed information.',
    },
    {
      question: 'How do I export project data?',
      answer: 'You can export project data by going to the project details page and clicking the "Export" button. Choose your preferred format (CSV, PDF, or Excel) and the data will be downloaded.',
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="help-container">
      <h1>Help Center</h1>

      {/* Search Section */}
      <div className="card help-search-section">
        <h2>Search Help Articles</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for help..."
            className="input search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                onClick={() => toggleFaq(index)}
                className="faq-question-button"
              >
                <span>{faq.question}</span>
                <span className="faq-toggle-icon">{openFaq === index ? '▲' : '▼'}</span>{/* Use text indicators */} 
              </button>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="card contact-section">
        <h2>Contact Support</h2>
        <div className="contact-list">
          <div className="contact-item">
            <span className="contact-icon">📧</span>{/* Use emoji */} 
            <div className="contact-details">
              <h3>Email Support</h3>
              <p>support@example.com</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>{/* Use emoji */} 
            <div className="contact-details">
              <h3>Phone Support</h3>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 