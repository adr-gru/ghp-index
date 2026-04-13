import Image from "next/image";

export const metadata = {
  title: "About | GHP-Index",
};

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">About GHP-Index</h1>
        <p className="text-lg text-secondary max-w-3xl mx-auto">
          A modern sports statistics platform combining passion for sports, data, and code.
        </p>
      </section>

      {/* Developer Section */}
      <section className="bg-card border border-edge rounded-lg p-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Profile Photo */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-edge">
              <Image
                src="/images/about/profile.png"
                alt="Adrian Grullon"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Adrian Grullon</h2>
              <p className="text-sm text-accent font-medium">4th Year Computer Science Student, Northeastern University</p>
            </div>
            <p className="text-secondary leading-relaxed">
              Since I was young, my hobbies have included sports, numbers, and coding. GHP-Index brings all three together
              into something meaningful and fleshed out—a platform I can proudly put my name behind. My intention is to deliver
              a fun, interactive experience for sports fans around the globe while showcasing modern web development practices.
            </p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">The Origin Story</h2>
        <div className="bg-card border border-edge rounded-lg p-6 space-y-4">
          <p className="text-secondary leading-relaxed">
            One day back in the summer of 2025, I was at my old retail job when two of my close friends—Britain and Caine—came
            with a proposal. They asked if I'd ever be interested in developing a sports statistics aggregator we could all contribute to.
            Britain was a 4th-year sports communication major looking to grow his online sports platform, and Caine had worked with smaller
            leagues and international baseball teams.
          </p>
          <p className="text-secondary leading-relaxed">
            We spent the rest of the day talking about site functionality, logos, color schemes, and themes. We named it <span className="text-accent font-semibold">G.H.P. Index</span>
            —an acronym of our initials. It could have been just another conversation, but I didn't want to leave it at that.
            Over the last few weeks, I've been working to bring this platform to production with a completed product that we can all be proud of.
          </p>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">The Tech Stack</h2>
        <div className="bg-card border border-edge rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Frontend</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">React 19</span> for reusable, maintainable components</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">Next.js 16</span> for routing, rendering, and structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">TypeScript</span> for type-safe development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">Tailwind CSS 4</span> for modern styling</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Backend</h3>
              <ul className="space-y-2 text-sm text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">Python + FastAPI</span> for data requests and processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">nba_api</span> for real-time NBA statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">In-memory caching</span> for performance optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-primary">Vercel + Railway</span> for production deployment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">What You Can Explore</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-edge rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-primary">NBA Teams</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Explore comprehensive team breakdowns including history, division, current record, full rosters, game logs,
              and in-depth statistics like turnover rate, effective field goal percentage, and points in the paint.
            </p>
          </div>

          <div className="bg-card border border-edge rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-primary">Player Profiles</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Dive into player pages featuring current season stats, biographical details, game logs, career history,
              AI-powered projections using linear regression and trend analysis, and side-by-side player comparisons.
            </p>
          </div>

          <div className="bg-card border border-edge rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-primary">Live Dashboard</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Quick access to today's games, league standings, statistical leaders, and recent results—all in one place
              with real-time updates and a clean, data-focused interface.
            </p>
          </div>

          <div className="bg-card border border-edge rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-primary">Advanced Analytics</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Shot charts with detailed filtering, EWMA-based performance projections, career statistics breakdowns,
              and comparative analysis tools to understand player performance at a deeper level.
            </p>
          </div>
        </div>
      </section>

      {/* Development Images */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">Development Journey</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="relative aspect-square bg-base border-2 border-edge rounded-lg overflow-hidden"
            >
              <Image
                src={`/images/about/dev-${num}.jpeg`}
                alt={`Development screenshot ${num}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Future Roadmap */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">What's Next</h2>
        <div className="bg-card border border-edge rounded-lg p-6 space-y-4">
          <p className="text-secondary leading-relaxed">
            The platform is just getting started. As GHP-Index expands, many other leagues including <span className="font-medium text-primary">NFL</span>,
            <span className="font-medium text-primary"> WNBA</span>, <span className="font-medium text-primary">MLB</span>, and
            <span className="font-medium text-primary"> NHL</span> are planned, with NFL and MLB already high on the priority list.
          </p>
          <p className="text-secondary leading-relaxed">
            Additional features in development include enhanced search functionality, bookmarks, advanced statistics like PER and usage rate,
            box scores for individual games, and AI-powered game summaries and performance breakdowns.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-bold text-primary">Start Exploring</h2>
        <p className="text-secondary max-w-2xl mx-auto">
          There are many features to discover and many more to come. Check out the dashboard, explore your favorite teams,
          dive into player statistics, and experience modern sports analytics.
        </p>
      </section>
    </main>
  );
}
