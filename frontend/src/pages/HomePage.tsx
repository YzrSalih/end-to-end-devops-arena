import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, BarChart3, GitBranch, Container, Activity } from 'lucide-react'
import FlowDiagram from '../components/FlowDiagram'

const STATS = [
  { value: '3', label: 'Microservices' },
  { value: 'mTLS', label: 'Service Mesh' },
  { value: '5', label: 'DevOps Phases' },
  { value: '100%', label: 'GitOps' },
]

const TECH = [
  { icon: '🐍', label: 'Python / Flask' },
  { icon: '🐹', label: 'Go / chi' },
  { icon: '🐰', label: 'RabbitMQ' },
  { icon: '☸️', label: 'Kubernetes' },
  { icon: '🔁', label: 'ArgoCD' },
  { icon: '🔒', label: 'Vault + Istio' },
  { icon: '📊', label: 'Prometheus' },
  { icon: '🔭', label: 'Jaeger' },
]

const FEATURES = [
  {
    icon: <Zap size={20} className="text-yellow-400" />,
    title: 'Event-Driven',
    desc: 'Async communication via RabbitMQ — services are fully decoupled.',
  },
  {
    icon: <Shield size={20} className="text-green-400" />,
    title: 'Zero-Trust Security',
    desc: 'Istio mTLS between all services. Secrets managed by HashiCorp Vault.',
  },
  {
    icon: <BarChart3 size={20} className="text-blue-400" />,
    title: 'Full Observability',
    desc: 'Metrics, traces, and logs with Prometheus, Jaeger, Loki & Grafana.',
  },
  {
    icon: <GitBranch size={20} className="text-violet-400" />,
    title: 'GitOps',
    desc: 'Every deploy is a git commit. ArgoCD syncs Helm charts automatically.',
  },
  {
    icon: <Container size={20} className="text-cyan-400" />,
    title: 'Container-Native',
    desc: 'Docker + Kubernetes on AWS EKS. Trivy scans every image on push.',
  },
  {
    icon: <Activity size={20} className="text-pink-400" />,
    title: 'CI/CD Pipeline',
    desc: 'GitHub Actions: lint → test → scan → build → push → deploy.',
  },
]

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function HomePage() {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px] animate-orb-1" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/20 blur-[100px] animate-orb-2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-600/10 blur-[80px] animate-orb-3" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass border border-indigo-500/30 px-4 py-1.5 rounded-full text-sm text-indigo-300 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Production-grade DevOps Portfolio
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Cloud-Native
            <br />
            <span className="gradient-text">Event-Driven</span>
            <br />
            Market
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Three microservices communicating asynchronously via RabbitMQ, deployed on Kubernetes with full observability, mTLS, and GitOps automation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/products" className="btn-primary flex items-center gap-2">
              Browse Products <ArrowRight size={16} />
            </Link>
            <Link to="/order" className="btn-ghost">
              Place an Order
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent"
          />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture flow */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            An order triggers an event that flows asynchronously through RabbitMQ to the notification worker.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8"
        >
          <FlowDiagram />
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center text-white mb-12"
        >
          Built for <span className="gradient-text">Production</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-16 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs uppercase tracking-widest text-slate-600 mb-8"
          >
            Tech Stack
          </motion.p>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH.map(({ icon, label }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass px-4 py-2 rounded-full text-sm text-slate-300 flex items-center gap-2"
              >
                <span>{icon}</span>
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Try the <span className="gradient-text">Order Flow</span>
          </h2>
          <p className="text-slate-400 mb-8 relative z-10">
            Place an order and watch it travel through the event-driven pipeline.
          </p>
          <Link to="/order" className="btn-primary inline-flex items-center gap-2 relative z-10">
            Place an Order <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </motion.main>
  )
}
