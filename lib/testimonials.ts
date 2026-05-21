export type Testimonial = {
  name: string;
  role: string;
  headline: string;
  quote: string;
  avatar: string;
};

const AVATAR = "/images/sections/testimonials";

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nick Winter",
    role: "CEO @CodeCombat",
    headline: "It’s everything I’ve wanted",
    quote:
      "\"Superflow is the fastest, easiest way to iterate on our apps and marketing pages. The UX is easy, the tech is brilliant, the team is like lightning–it’s everything I’ve wanted and tried to build into our websites myself for 15 years. Finally!\"",
    avatar: `${AVATAR}/nick.jpg`,
  },
  {
    name: "DeAndre Holland",
    role: "Designer @Lenus",
    headline: "This is an investment that I’m so grateful for!",
    quote:
      "\"I’m incredibly grateful for this investment! Superflow with Webflow has made client feedback seamless. No more back and forth calls or messages, or using tools like Bubbles. It’s a great time-saver!\"",
    avatar: `${AVATAR}/deandre.jpg`,
  },
  {
    name: "Ana Wegbreit",
    role: "Head of BD @ECOM Dept",
    headline: "Saves our team a ton of time!",
    quote:
      "\"Thanks for creating a tool that helps us streamline communication with clients, it’s great to have everything in one place and saves our team a ton of time when collaborating.\"",
    avatar: `${AVATAR}/ana.png`,
  },
  {
    name: "Caleb",
    role: "Digital Designer @Calbie Creative",
    headline: "No more juggling multiple feedback",
    quote:
      "\"Superflow simplifies live website annotation, centralizing client comments for seamless organization. No more juggling multiple feedback channels. The responsive team welcomes suggestions, making it a truly collaborative experience. Highly recommended for an efficient and open-door workflow!\"",
    avatar: `${AVATAR}/caleb.png`,
  },
  {
    name: "Eric Lessman",
    role: "Co-founder & CEO @ Bluecap",
    headline: "Eliminating time wasted on vague instruction",
    quote:
      "\"Superflow streamlines front-end design coordination, eliminating time wasted on vague instructions. Clicking comments highlights specific website areas instantly. The receptive team implements feedback promptly, making collaboration effortless.\"",
    avatar: `${AVATAR}/eric.jpg`,
  },
  {
    name: "Manvi Agarwal",
    role: "Head of Content @Writesonic",
    headline: "Empowers non-tech users like me",
    quote:
      "\"Superflow revolutionized how my team works with Webflow. Streamlining collaboration and communication, it saves time, empowers non-tech users like me, and delivers high-quality results fast. I highly recommend it for simplified web development and enhanced collaboration.\"",
    avatar: `${AVATAR}/manvi.jpg`,
  },
  {
    name: "Simon Smallchua",
    role: "COO @ Harvey",
    headline: "Clear, Simple & Saves time for everyone involved",
    quote:
      "\"Collaborating on websites is transformed with Superflow. It saves time clarifying feedback, assigning tasks, and resolving actions in real-time. The intuitive interface, image/screen recording support, and responsive team make it our top choice. Efficient and user-friendly!\"",
    avatar: `${AVATAR}/simon-harvey.jpg`,
  },
  {
    name: "Riley Hennigh",
    role: "Product Designer @Headway.io",
    headline: "Everybody has loved how easy it is to get started",
    quote:
      "\"Superflow simplifies collaboration, enabling fast feedback from stakeholders during website design and development. Easy to use, loved by all, and seamlessly compatible with mobile, it’s a powerful tool for efficient project workflows.\"",
    avatar: `${AVATAR}/riley.png`,
  },
];
