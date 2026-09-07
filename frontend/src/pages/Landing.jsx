import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Zap, Shield, BarChart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const Landing = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-32 pb-20 dark:bg-slate-950 sm:pt-40 sm:pb-24">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 h-[600px] w-[600px] rounded-full bg-primary-600/10 blur-[100px] dark:bg-primary-500/20"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-600/20"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 dark:border-primary-900/50 dark:bg-primary-900/20 dark:text-primary-400 mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse"></span>
                Introducing NexusAI 2.0
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl xl:text-7xl">
                Master Skills with <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">AI-Powered</span> Learning
              </motion.h1>
              
              <motion.p variants={fadeIn} className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
                NexusAI provides personalized learning paths, real-time analytics, and adaptive skill assessments to help you achieve your career goals faster than ever.
              </motion.p>
              
              <motion.div variants={fadeIn} className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-primary-500/50"
                >
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center gap-2">Start Learning Now <ArrowRight size={20} /></span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-xl premium-glass px-8 py-4 text-base font-bold text-slate-900 transition-all hover:bg-white/80 dark:text-white dark:hover:bg-slate-800/80 hover:scale-105"
                >
                  View Assessments
                </Link>
              </motion.div>
              
              <motion.div variants={fadeIn} className="mt-8 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <img key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-950" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  ))}
                </div>
                <p>Join <span className="font-semibold text-slate-900 dark:text-white">10,000+</span> professionals learning today</p>
              </motion.div>
            </motion.div>

            {/* Dashboard Preview Hero Right */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl border border-slate-200/50 bg-white/40 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/40">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden relative">
                  {/* Fake Browser Header */}
                  <div className="flex h-10 items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  {/* Fake Dashboard Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="h-24 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-center px-4">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div className="h-5 w-10 bg-primary-200 dark:bg-primary-900 rounded"></div>
                      </div>
                      <div className="h-24 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col justify-center px-4">
                         <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                         <div className="h-5 w-12 bg-green-200 dark:bg-green-900 rounded"></div>
                      </div>
                    </div>
                    <div className="h-32 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-100/50 dark:from-primary-900/20 to-transparent"></div>
                       <svg className="absolute bottom-0 w-full h-full text-primary-300 dark:text-primary-700/50" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M0,100 Q10,70 30,80 T60,40 T100,50 L100,100 Z" fill="currentColor" stroke="none" opacity="0.3"></path>
                         <path d="M0,80 Q20,50 40,60 T70,30 T100,40" stroke="currentColor"></path>
                       </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Element */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 top-20 rounded-xl border border-slate-200 bg-white/90 backdrop-blur p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800/90 flex items-center gap-3 z-10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Assessment Passed</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">React Mastery - 98%</p>
                </div>
              </motion.div>
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-6 text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            {/* Using text logos for demo purposes */}
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tighter">ACME<span className="text-primary-600">CORP</span></h3>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Global<span className="font-light">Tech</span></h3>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Stark<span className="text-primary-500">.</span></h3>
            <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200 italic">Wayne Ent.</h3>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">INITECH</h3>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Active Students', value: '10K+' },
              { label: 'Pro Courses', value: '500+' },
              { label: 'Success Rate', value: '95%' },
              { label: 'AI Tutor Support', value: '24/7' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <h4 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{stat.value}</h4>
                <p className="mt-2 font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 dark:bg-slate-950 sm:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why choose NexusAI?
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Our platform uses cutting-edge artificial intelligence to revolutionize the way you learn, adapt, and grow in your career.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, title: 'Adaptive Learning', desc: 'AI tailors content to your pace and learning style dynamically.' },
              { icon: BarChart, title: 'Real-time Analytics', desc: 'Track your progress with incredibly detailed performance insights.' },
              { icon: Zap, title: 'Interactive Quizzes', desc: 'Test your knowledge with dynamic, scenario-based questions.' },
              { icon: Shield, title: 'Certified Skills', desc: 'Earn verifiable, industry-recognized certificates upon completion.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-3xl premium-glass p-8 transition-all hover:shadow-xl hover:neon-glow overflow-hidden"
              >
                {/* Subtle gradient bg on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 text-primary-600 shadow-inner transition-all duration-300 group-hover:from-primary-600 group-hover:to-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/30 dark:from-primary-900/40 dark:to-purple-900/40 dark:text-primary-400">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
