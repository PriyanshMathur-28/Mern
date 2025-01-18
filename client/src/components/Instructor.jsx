import "../styles/Instructor.css";
import instructorImage from "../assets/p1.jpg";

const Instructor = () => {
  return (
    <div className="instructor-page">
      <div className="instructor-card">
        <div className="instructor-image">
          <img src={instructorImage} alt="Instructor" />
        </div>
        <div className="instructor-info">
          <h1>Priyansh Mathur</h1>
          <h4>Creator.</h4>
          <p>
          Full Stack Developer, I create websites using HTML, CSS, JavaScript, React JS, Express JS, Node JS, Tailwind Css and other technologies. I am passionate about creating user-friendly and responsive websites that meet the needs of users. I am a quick learner and enjoy working with new technologies. I have more than 6 months of experience in web development and have worked on several projects. I am excited to continue learning and growing as an individual and as a developer.


          </p>
          <div className="social-links">
            <a
              href="https://github.com/PriyanshMathur-28"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/priyanshmathur28/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/craftedbypriyansh/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
