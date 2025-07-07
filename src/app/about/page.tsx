import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FlaskConical, HeartHandshake, Info, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold text-primary tracking-tight sm:text-5xl">
          Acerca de MedSanTools
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Plataforma Inteligente de Análisis Clínico y Soporte Diagnóstico Avanzado.
        </p>
      </header>

      <div className="space-y-8">
        {/* Section 1: ¿Quiénes somos? */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Users className="mr-3 h-6 w-6 text-primary" />
              ¿Quiénes Somos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground/90">
            <p><strong>MedSanTools</strong> es un proyecto conceptual desarrollado como una aplicación de demostración para exhibir las capacidades de la IA en la asistencia clínica. Nació de la visión de crear herramientas inteligentes que no reemplacen, sino que potencien el juicio y la eficiencia del profesional de la salud.</p>
            <p>Nuestro valor fundamental es la <strong>sinergia entre el médico y la máquina</strong>, buscando optimizar tareas repetitivas y ofrecer análisis profundos para que los profesionales puedan dedicar más tiempo al cuidado directo del paciente y a la toma de decisiones críticas.</p>
          </CardContent>
        </Card>

        {/* Section 2: ¿Qué hacemos? */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <FlaskConical className="mr-3 h-6 w-6 text-primary" />
              ¿Qué Hacemos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground/90">
            <p>Ofrecemos una suite de herramientas de software asistidas por IA, diseñadas para resolver desafíos comunes en la práctica clínica diaria. Desde la mejora de la redacción de notas médicas hasta el análisis de imágenes y la sugerencia de planes terapéuticos, nuestra plataforma está orientada a agilizar flujos de trabajo y proporcionar una capa adicional de soporte diagnóstico.</p>
            <p>Nos dirigimos a <strong>médicos, residentes, y estudiantes de medicina</strong> que buscan optimizar su tiempo, mejorar la calidad de su documentación y explorar las posibilidades que la IA ofrece en el campo de la salud.</p>
          </CardContent>
        </Card>

        {/* Section 3: ¿Por qué lo hacemos? */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <HeartHandshake className="mr-3 h-6 w-6 text-primary" />
              ¿Por Qué Lo Hacemos?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground/90">
            <div>
              <h4 className="font-semibold">Misión</h4>
              <p>Nuestra misión es proporcionar a los profesionales de la salud herramientas de IA avanzadas, intuitivas y seguras que mejoren la eficiencia clínica, la precisión diagnóstica y, en última instancia, la calidad de la atención al paciente.</p>
            </div>
            <div>
              <h4 className="font-semibold">Visión</h4>
              <p>Nos proyectamos como un referente en la creación de software de asistencia clínica, donde la inteligencia artificial actúa como un copiloto confiable para el médico, integrándose de manera transparente en su rutina diaria y contribuyendo a un sistema de salud más inteligente y humano.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Info className="mr-3 h-6 w-6 text-primary" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-card-foreground/90">
            <div>
              <h4 className="font-semibold">Innovación Clave</h4>
              <p>La singularidad de MedSanTools radica en su enfoque modular e integrado. Cada herramienta, aunque potente por sí sola, está diseñada para comunicarse con las demás, creando un flujo de datos coherente que enriquece el contexto clínico a cada paso, desde la carga de un documento hasta la generación de un resumen de egreso.</p>
            </div>
            <div>
              <h4 className="font-semibold">Tecnologías Utilizadas</h4>
              <p>La plataforma está construida sobre un stack tecnológico moderno, incluyendo <strong>Next.js</strong> para el frontend, <strong>React</strong> y <strong>TypeScript</strong> para la interactividad, <strong>TailwindCSS</strong> y <strong>ShadCN/UI</strong> para un diseño adaptable, y <strong>Genkit (Google AI)</strong> como motor de inteligencia artificial.</p>
            </div>
             <div>
              <h4 className="font-semibold">Estado del Desarrollo</h4>
              <p>Esta aplicación es un <strong>prototipo funcional</strong> en constante evolución, diseñado con fines de demostración. No está certificada para uso clínico real.</p>
            </div>
            <div>
              <h4 className="font-semibold">Contacto y Enlaces</h4>
              <div className="flex items-center space-x-4 mt-2">
                <Link href="#" className="text-muted-foreground hover:text-primary"><Github className="h-6 w-6" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-6 w-6" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary"><Mail className="h-6 w-6" /></Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
