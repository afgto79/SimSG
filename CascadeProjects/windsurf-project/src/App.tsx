import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './App.css';

function App() {
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Schéma de validation avec Zod
  const schema = z.object({
    surface: z.number().min(1, "La surface est requise"),
    prixAchat: z.number().min(1, "Le prix d'achat est requis"),
    travaux: z.number().min(0, "Le montant doit être positif"),
    apport: z.number().min(0, "L'apport doit être positif"),
    duree: z.number().min(1, "La durée est requise"),
    taux: z.number().min(0.1, "Le taux est requis"),
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      surface: 100,
      prixAchat: 200000,
      travaux: 50000,
      apport: 50000,
      duree: 20,
      taux: 3.5
    }
  });

  const onSubmit = (data: FormData) => {
    try {
      // Simulation de calcul
      const montantEmprunte = data.prixAchat + data.travaux - data.apport;
      const tauxMensuel = data.taux / 100 / 12;
      const nbMensualites = data.duree * 12;
      
      const mensualite = (montantEmprunte * tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) / 
                        (Math.pow(1 + tauxMensuel, nbMensualites) - 1);

      setResult({
        mensualite: Math.round(mensualite),
        montantEmprunte
      });
      setErrors([]);
    } catch (error) {
      setErrors(["Une erreur est survenue lors du calcul"]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Simulateur d'investissement locatif</h1>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Surface (m²)</label>
              <input
                type="number"
                {...register('surface', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {formErrors.surface && (
                <p className="mt-1 text-sm text-red-600">{formErrors.surface.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prix d'achat (€)</label>
              <input
                type="number"
                {...register('prixAchat', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Calculer
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Résultats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-medium text-gray-500">Mensualité</p>
                <p className="text-xl font-semibold">{result.mensualite} €</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-medium text-gray-500">Montant emprunté</p>
                <p className="text-xl font-semibold">{result.montantEmprunte} €</p>
              </div>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <footer className="mt-8 text-xs text-gray-500">
          Format FR, TTC. Arrondis: € à l'unité, % au dixième. v1 sans graphiques.
        </footer>
      </div>
    </div>
  );
}

export default App;
