import about2 from '@/public/about2.webp'
import Image from 'next/image'

function OurMission() {
  return (
    <section className='my-16' id='mission'>
      <div className='mx-auto w-full max-w-[1400px] px-5 py-16 md:px-10 md:py-12 lg:py-16'>
        <h2 className='mb-8 text-3xl font-bold md:text-5xl lg:mb-14'>
          Conheça a AmpeDent: onde os sorrisos brilham mais
        </h2>
        <p className='mb-8  text-sm text-slate-800 sm:text-base lg:mb-24 '>
          Cansado da ansiedade de ir ao dentista? Pronto para viver um cuidado odontológico realmente agradável? Bem-vindo à AmpeDent, seu refúgio odontológico acolhedor no bairro! Estamos aqui para mudar a forma como você pensa sobre ir ao dentista, com experiência gentil, tecnologia moderna e foco no seu conforto em cada etapa.
        </p>
        <div className='grid gap-10 lg:grid-cols-2 lg:gap-12'>
          <Image
            placeholder='blur'
            height={1000}
            width={1000}
            src={about2}
            alt='imagem de paciente sorrindo'
            className='object-contain rounded'
          />
          <div className='flex flex-col gap-5 rounded-2xl border border-solid border-black p-10 sm:p-20'>
            <h2 className='text-3xl font-bold md:text-5xl'>Nossa missão</h2>
            <p className='text-sm text-slate-800 sm:text-base '>
              Na AmpeDent, nossa missão é oferecer cuidado odontológico excepcional em um ambiente confortável e acolhedor. Temos o compromisso de orientar nossos pacientes por meio da educação em saúde bucal, oferecendo uma variedade de serviços completos, dos cuidados preventivos aos procedimentos restauradores.
              <br /> Nossa equipe de profissionais dedicados acompanha os avanços mais recentes da tecnologia odontológica para garantir que nossos pacientes recebam o melhor atendimento possível. Acreditamos em construir relacionamentos de longo prazo com nossos pacientes, baseados em confiança e respeito mútuos. <br /> Nosso objetivo é ajudar cada paciente a conquistar e manter um sorriso saudável e bonito por toda a vida. Esperamos receber você em nossa família odontológica e prometemos tornar sua experiência conosco positiva.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
export default OurMission
