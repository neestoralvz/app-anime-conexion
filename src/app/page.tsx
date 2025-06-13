export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          App Anime Conexión
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Collaborative anime selection app for couples
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
          <button className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg transition-colors">
            Create Session
          </button>
          <button className="bg-secondary hover:bg-secondary-dark text-white font-bold py-4 px-6 rounded-lg transition-colors">
            Join Session
          </button>
        </div>
      </div>
    </main>
  );
}