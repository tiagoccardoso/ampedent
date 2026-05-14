function OurServices() {
  return (
    <section
      className='mx-auto w-full max-w-[1400px] md:py-20 lg:py-26 mt-8 px-4 md:px-0'
      id='services'>
      <h2 className='text-center text-3xl font-bold md:text-5xl mt-8'>
        Nossos serviços odontológicos
      </h2>

      <div className='grid md:grid-cols-2 grid-cols-1 md:gap-8 gap-6 max-w-[1400px] w-full mx-auto md:justify-stretch my-32 text-balance'>
        <div className='bg-sky-50 p-8 border border-solid border-black rounded'>
          <h2 className='text-3xl font-bold'>Estética e eletivos</h2>
          <hr className='w-40 my-8 border-2 border-black' />

          <p className='mt-4'>
            Está insatisfeito com algum aspecto do seu sorriso? Tem dificuldade para mastigar ou percebe que seus dentes estão finos ou desgastados? A odontologia restauradora e estética pode ajudar você a conquistar o sorriso dos sonhos, aumentar sua autoestima e melhorar sua saúde geral e sua capacidade de voltar a comer com prazer. Também oferecemos clareamento dental para uso em casa, ajudando a iluminar seu sorriso e aumentar sua confiança.
          </p>
          <ul className='px-2'>
            <li className='my-2 list-none'>
              Nossos tratamentos odontológicos estéticos e restauradores incluem:
            </li>
            <li>Facetas de porcelana</li>
            <li>Facetas em resina composta</li>
            <li>Coroas, pontes e restaurações sobre implantes</li>
            <li>Reabilitação oral completa acessível para sorriso e função</li>
            <li>
              All-on-4, próteses fixas implantossuportadas e próteses híbridas
            </li>
            <li>Kits personalizados de clareamento dental caseiro e clareamento em consultório</li>
          </ul>
        </div>
        <div className='bg-sky-50 p-8 border border-solid border-black rounded'>
          <h2 className='text-3xl font-bold'>Preventiva e geral</h2>
          <hr className='w-40 my-8 border-2 border-black' />

          <p className='mt-4'>
            Prevenir é melhor do que remediar. A odontologia preventiva ajuda a manter seu sorriso em excelente forma enquanto evita problemas odontológicos sérios. Consultas regulares facilitam a identificação de possíveis riscos à saúde bucal antes que se tornem preocupações maiores. A limpeza dental também pode prevenir doença gengival, cáries e deterioração dos dentes.
          </p>
          <ul className='px-2'>
            <li className='my-2 list-none'>
              Nossos serviços de odontologia geral incluem:
            </li>
            <li>Limpezas e exames dentais</li>
            <li>Radiografias panorâmicas</li>
            <li>Selantes dentais</li>
            <li>Tratamentos com flúor</li>
            <li>Protetores bucais e placas noturnas</li>
            <li>Aparelhos para apneia do sono</li>
            <li>Terapia para ATM/DTM</li>
          </ul>
        </div>
        <div className='bg-sky-50 p-8 md:col-span-2 border border-solid border-black rounded'>
          <h3 className='text-3xl font-bold'>Transformação completa do sorriso</h3>
          <hr className='w-40 my-8 border-2 border-black' />
          <p className='mt-8'>
            A perda dentária é extremamente comum. Felizmente, avanços médicos importantes trouxeram diversas opções de tratamento odontológico para restaurar sua autoestima e sua capacidade de comer, falar e sorrir com confiança. Próteses implantossuportadas, às vezes chamadas de all-on-four, próteses híbridas, próteses sobre implantes ou dentes em um dia, substituem todos os dentes superiores e/ou inferiores. Elas são mais seguras do que próteses tradicionais, e os implantes atuam como raízes artificiais, estimulando a mandíbula e ajudando a prevenir a perda óssea.
          </p>
        </div>
      </div>
    </section>
  )
}
export default OurServices
