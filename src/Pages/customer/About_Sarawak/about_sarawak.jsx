import React from 'react';

//Import Component
import Navbar from '../../../Component/Navbar/navbar';
import Footer from '../../../Component/Footer/footer';
import Sarawak_Map from '../../../Component/Sarawak Map/Map';
import Back_To_Top_Button from '../../../Component/Back_To_Top_Button/Back_To_Top_Button';

//Import css
import './about_sarawak.css';

//Import Images
import Bako from '../../../public/Bako.jpg';
import Bird from '../../../public/Bird.jpg';
import Sarawak from '../../../public/Sarawak.png';
import Cave from '../../../public/cave.jpg';
import Cave2 from '../../../public/monkey.png';
import Temple from '../../../public/Temple.jpg';
import Church from '../../../public/Church.png';
import Laksa from '../../../public/Laksa.jpg';
import KoloMee from '../../../public/KoloMee.png';
import Forest from '../../../public/forest.png';


const About_Sarawak = () => {
  return (
    <div>
      <Navbar />
      
      {/* Destination */}
      <div className='destination_AboutSarawak'>
        <h1>Place To Visit</h1>

        <Sarawak_Map />

        <div className='Main_description_AboutSarawak'>
          <h1>About Sarawak</h1>
          <p>Adventure, Culture and Nature in One</p>
        </div>

        <div className='first-des_AboutSarawak'>
          <div className='des-text_AboutSarawak'>

            <h2>About Sarawak</h2>

            <p className='location_description_AboutSarawak'>
              Nestled on the island of Borneo, Sarawak is Malaysia's largest state, renowned 
              for its rich cultural tapestry, diverse wildlife, and breathtaking natural landscapes. 
              Often referred to as the "Land of the Hornbills," Sarawak offers an unparalleled journey 
              into the heart of Southeast Asia.
            </p>

          </div>

          <div className='image_AboutSarawak'>
            <img alt='Wind Cave' src={Bird} />
            <img alt='Wind Cave 2' src={Sarawak} />
          </div>
        </div>

        <br /><br />

        <div className='first-des_AboutSarawak'>
          <div className='des-text_AboutSarawak'>

            <h2>Cultural Diversity</h2>

            <p className='location_description_AboutSarawak'>
              Home to over 27 ethnic groups, including the Iban, Bidayuh, and Orang Ulu, Sarawak boasts a mosaic of traditions, 
              languages, and beliefs. Visitors can immerse themselves in this cultural diversity by exploring traditional longhouses, 
              participating in local festivals, and visiting the Sarawak Cultural Village, which showcases the heritage of these indigenous communities.
            </p>

          </div>

          <div className='image_AboutSarawak'>
            <img alt='Damai Beach 1' src={Temple} />
            <img alt='Damai Beach 2' src={Church} />
          </div>
        </div>

        <br /><br />

        <div className='first-des_AboutSarawak'>
          <div className='des-text_AboutSarawak'>

            <h2>Natural Wonders</h2>

            <p className='location_description_AboutSarawak'>
              Sarawak's lush rainforests and diverse ecosystems are protected within numerous national parks. Bako National Park, easily 
              accessible from Kuching, is famed for its proboscis monkeys and varied landscapes. Gunung Mulu National Park, a UNESCO World 
              Heritage Site, captivates with its vast cave systems and the iconic limestone Pinnacles.
            </p>

          </div>

          <div className='image_AboutSarawak'>
            <img alt='Damai Beach 1' src={Bako} />
            <img alt='Damai Beach 2' src={Forest} />
          </div>
        </div>

        <br /><br />

        <div className='first-des_AboutSarawak'>
          <div className='des-text_AboutSarawak'>

            <h2>Wildlife Encounters</h2>

            <p className='location_description_AboutSarawak'>
              For wildlife enthusiasts, Sarawak offers opportunities to observe orangutans in their natural habitat at centers 
              like the Semenggoh Wildlife Rehabilitation Centre. The state's rivers and coastal areas are also home to diverse 
              marine life and bird species, making it a haven for nature lovers.
            </p>

          </div>

          <div className='image_AboutSarawak'>
            <img alt='Damai Beach 1' src={Cave} />
            <img alt='Damai Beach 2' src={Cave2} />
          </div>
        </div>

        <br /><br />

        <div className='first-des_AboutSarawak'>
          <div className='des-text_AboutSarawak'>

            <h2>Culinary Delights</h2>

            <p className='location_description_AboutSarawak'>
              The state's diverse cultural landscape is mirrored in its cuisine. Dishes like Sarawak laksa, 
              kolo mee, and traditional Iban fare offer a gastronomic journey that delights the senses. Exploring 
              local markets and food stalls provides an authentic taste of Sarawak's culinary heritage.
            </p>

          </div>

          <div className='image_AboutSarawak'>
            <img alt='Damai Beach 1' src={Laksa} />
            <img alt='Damai Beach 2' src={KoloMee} />
          </div>
        </div>

      </div>

      <Back_To_Top_Button />
      <Footer />
    </div>
  );
};

export default About_Sarawak;