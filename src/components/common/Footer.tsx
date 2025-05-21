const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground py-8 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Audio Emporium. All rights reserved.</p>
        <p className="text-sm">Designed with <span className="text-primary">❤</span> by Your Shopping Partner</p>
      </div>
    </footer>
  );
};

export default Footer;
