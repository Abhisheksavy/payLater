import { ShieldCheck, Zap, Gift } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Logo from '../../assets/Logo.svg';

export default function Footer() {
  return (
    <footer className="w-full bg-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div>
                  <div className="">
            <img src={Logo} alt="Everyday Bill Logo" className="w-20 h-20 object-contain" />
          </div>

          <div className="flex flex-col md:flex-row items-center text-[#9CA3AF] gap-4 md:gap-0">

            <div>

              <p className="mt-4 text-sm">
                Transform your bill management experience. Upload bills, earn rewards,
                and stay in control of your finances.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-300">
                  <FaFacebookF size={18} />
                </a>
                <a href="#" className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-300">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-300">
                  <FaLinkedinIn size={18} />
                </a>
                <a href="#" className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-300">
                  <FaInstagram size={18} />
                </a>
              </div>
            </div>

            <div className="w-full flex flex-row justify-around">
              {/* Column 1 */}
              <div>
                <ul className="space-y-3 text-[#9CA3AF] text-sm">
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Pricing</a></li>
                  <li><a href="#">Rewards</a></li>
                  <li><a href="#">Security</a></li>
                </ul>
              </div>

              {/* Column 2 */}
              <div>
                <ul className="space-y-3 text-[#9CA3AF] text-sm">
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Press</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <ul className="space-y-3 text-[#9CA3AF] text-sm">
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-black py-6 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#9CA3AF]">
          <p>© 2025 Everyday Bill. All rights reserved.</p>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1">
              <ShieldCheck className="text-success" size={16} /> Secure
            </span>
            <span className="flex items-center gap-1 ">
              <Zap className="text-yellow-500" size={16} /> Fast
            </span>
            <span className="flex items-center gap-1 ">
              <Gift className="text-purple-500" size={16} /> Rewarding
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
