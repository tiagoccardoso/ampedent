import BookVisit from '../components/layout/BookVisit'
import about from '@/public/about.webp'
import OurTeamAbout from '../components/about/OurTeamAbout'
import OurMission from '../components/about/OurMission'
import HeroContainer from '../components/layout/HeroContainer'
import { Metadata } from 'next'
import HeroHeaders from '../components/layout/HeroHeaders'
import { getSiteContent, getTeamMembers } from '@/lib/siteContent'

export const metadata: Metadata = {
  title: 'Sobre',
}

async function About() {
  const content = await getSiteContent()
  const members = getTeamMembers(content)

  return (
    <>
      <HeroContainer backgroundImage={about.src}>
        <HeroHeaders />
      </HeroContainer>
      <OurMission />
      <OurTeamAbout members={members} />
      <BookVisit />
    </>
  )
}
export default About
