import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';

export default function TermsAndConditions() {
  return (
    <>
      <PageMeta
        title="Terms & Conditions | Quest"
        description="Terms and Conditions for using the Lifestyles Quest platform"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-brand-600 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="mb-4 inline-block text-white/80 hover:text-white"
            >
              &larr; Back to Quest
            </Link>
            <h1 className="text-3xl font-bold text-white">Terms &amp; Conditions</h1>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 sm:p-8">
            <div className="max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-4">
              <p className="font-bold text-red-600 dark:text-red-400">
                IF YOU DO NOT AGREE WITH THESE TERMS, DO NOT USE THIS WEB SITE.
              </p>

              <p>
                Welcome to LIFESTYLES DISCOVERY LLC's Lifestyles Quest web site (the "Web Site").
                The goal of this Web Site is to provide you with access to the most comprehensive
                network of residential real estate products/services and related links to meet your
                needs (the "Content"). Please read our Terms of Use (the "Terms") carefully before
                continuing on with your use of this Web Site. These Terms shall govern the use of
                the Web Site and apply to all Internet traffic visiting the Web Site. By accessing
                or using this Web Site, you agree to the Terms.
              </p>

              <p>
                LIFESTYLES DISCOVERY LLC ("We", "Us", "Our") reserves the right, in its sole discretion,
                to modify, alter or otherwise update these Terms at any time. Such modifications
                shall be effective immediately upon posting. By using this Web Site after we have
                posted notice of such modifications, alterations or updates you agree to be bound
                by such revised Terms.
              </p>

              <p>
                In accordance with our goals, this Web Site will permit you to link to many other
                web sites, that may or may not be affiliated with this Web Site and/or LIFESTYLES
                DISCOVERY LLC, and that may have terms of use that differ from, or contain terms in
                addition to, the terms specified here. Your access to such web sites through links
                provided on this Web Site is governed by the terms of use and policies of those
                sites, not this Web Site.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Buyer Representation</h2>
              <p>
                When a Lifestyles Realty, Inc. real estate agent presents you with a property, and you
                analyze it on this web site, you agree to the Residential Buyer Representation Agreement.
              </p>
              <p>
                <a
                  href="https://s3.amazonaws.com/liberator-subscriber-documents/BuyerRepAgreement.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View Buyer Representation Agreement (PDF)
                </a>
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Brokerage Services</h2>
              <p>
                When you use Lifestyles Realty as your broker and you use this web site, you acknowledge
                you have read the Information About Brokerage Services.
              </p>
              <p>
                <a
                  href="https://s3.amazonaws.com/liberator-subscriber-documents/BrokerageServicesInfo.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  View Information About Brokerage Services (PDF)
                </a>
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Privacy</h2>
              <p>
                Registration on this Web Site data and certain other information about you is subject
                to our Privacy Policy. For more information, please review our full{' '}
                <Link to="/privacy" className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Privacy Policy
                </Link>.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Trademarks, Copyrights and Restrictions</h2>
              <p>
                This Web Site is controlled and operated by LIFESTYLES DISCOVERY LLC, 11200 WESTHEIMER,
                SUITE 1000, HOUSTON, TEXAS 77042, telephone (713) 782-0018. All content on this
                Web Site, including, but not limited to text, images, illustrations, audio clips,
                and video clips, is protected by copyrights, trademarks, service marks, and/or other
                intellectual property rights (which are governed by U.S. and worldwide copyright
                laws and treaty provisions, privacy and publicity laws, and communication regulations
                and statutes), and are owned and controlled by LIFESTYLES DISCOVERY LLC or its affiliates,
                or by third party content providers, merchants, sponsors and licensors (collectively
                "Providers") that have licensed their content or the right to market their products
                and/or services to Lifestyles Discovery LLC.
              </p>
              <p>
                Content on this Web Site or any web site owned, operated, licensed or controlled by
                the Providers is solely for your personal, non-commercial use. You may print a copy
                of the Content and/or information contained herein, using the print function only,
                for your personal, non-commercial use only, but you may not copy, reproduce, republish,
                upload, post, transmit, distribute, and/or exploit the Content or information in any
                way (including by e-mail or other electronic means) for commercial use without the
                prior written consent of LIFESTYLES DISCOVERY LLC or the Providers. You may request
                consent by faxing a request to LIFESTYLES DISCOVERY LLC at 713-782-0161.
              </p>
              <p>
                Without the prior written consent of LIFESTYLES DISCOVERY LLC or the Providers, your
                modification of the Content, use of the Content on any other web site or networked
                computer environment, or use of the Content for any purpose other than personal,
                non-commercial use, violates the rights of the owners of LIFESTYLES DISCOVERY LLC
                and/or the Provider copyrights, trademarks or service marks and other proprietary
                rights, and is prohibited.
              </p>
              <p>
                As a condition to your use of this Web Site, you warrant to LIFESTYLES DISCOVERY LLC
                that you will not use our Web Site for any purpose that is unlawful or prohibited by
                these Terms, including without limitation the posting or transmitting any threatening,
                libelous, defamatory, obscene, scandalous, inflammatory, pornographic, or profane
                material. If you violate any of these Terms, your permission to use our Web Site
                immediately terminates without the necessity of any notice.
              </p>
              <p>
                LIFESTYLES DISCOVERY LLC retains the right to deny access to anyone at its discretion
                for any reason, including for violation of these Terms. You may not use on your web
                site any trademarks, service marks or copyrighted materials appearing on this Web Site,
                including but not limited to any logos or characters, without the express written
                consent of the owner of the mark or copyright. You may not frame or otherwise
                incorporate into another web site any of the Content or other materials on this Web
                Site without prior written consent of Lifestyles Discovery LLC.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Prohibited Activities</h2>
              <p>
                You are specifically prohibited from any use of this Web Site, and You agree not to
                use or permit others to use this Web Site, to:
              </p>
              <ul className="list-disc pl-6">
                <li>Take any action that imposes an unreasonable or disproportionately large load on the Web Site's infrastructure, including but not limited to "spam" or other such unsolicited mass e-mailing techniques</li>
                <li>Disclose or share the assigned confirmation numbers and/or passwords with any unauthorized third parties or use the assigned confirmation numbers and/or passwords for any unauthorized purpose</li>
                <li>Attempt to decipher, decompile, disassemble or reverse engineer any of the software or HTML code comprising or in any way making up a part of this Web Site</li>
                <li>Upload, post, email or otherwise transmit any information, Content, or proprietary rights that You do not have a right to transmit under any law or under contractual or fiduciary relationships</li>
                <li>Violate any applicable local, state, national or international law</li>
                <li>Use any robot, spider, intelligent agent, other automatic device, or manual process to search, monitor or copy our Web pages, or the Content without our prior written permission</li>
              </ul>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Links</h2>
              <p>
                This Web Site may contain links to other web sites ("Linked Sites"). The Linked Sites
                are provided for your convenience and information only and, as such, you access them
                at your own risk. The content of any Linked Sites is not under LIFESTYLES DISCOVERY LLC's
                control, and LIFESTYLES DISCOVERY LLC is not responsible for, and does not endorse,
                such content, whether or not LIFESTYLES DISCOVERY LLC is affiliated with the owners
                of such Linked Sites. You may not establish a hyperlink to this Web Site or provide
                any links that state or imply any sponsorship or endorsement of your web site by
                LIFESTYLES DISCOVERY LLC or its affiliates or Providers.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Disclaimer of Warranties and Liability</h2>
              <p className="uppercase text-xs">
                ALL CONTENT ON THIS WEB SITE IS PROVIDED "AS IS" AND WITHOUT WARRANTIES OF ANY KIND
                EITHER EXPRESS OR IMPLIED. OTHER THAN THOSE WARRANTIES WHICH, UNDER THE U.S. LAWS
                APPLICABLE TO THESE TERMS, ARE IMPLIED BY LAW AND ARE INCAPABLE OF EXCLUSION, RESTRICTION,
                OR MODIFICATION, LIFESTYLES DISCOVERY LLC DISCLAIMS ANY AND ALL WARRANTIES, EXPRESS
                OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY
                AND FITNESS FOR A PARTICULAR PURPOSE.
              </p>
              <p className="uppercase text-xs">
                NEITHER LIFESTYLES DISCOVERY LLC, ITS AFFILIATED OR RELATED ENTITIES, NOR THE PROVIDERS,
                NOR ANY PERSON INVOLVED IN THE CREATION, PRODUCTION, AND DISTRIBUTION OF THIS WEB SITE
                WARRANT THAT THE FUNCTIONS CONTAINED IN THIS WEB SITE WILL BE UNINTERRUPTED OR ERROR-FREE,
                THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVER THAT MAKES THE CONTENT AVAILABLE
                WILL BE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              <p className="uppercase text-xs">
                YOU EXPRESSLY AGREE THAT USE OF THIS WEB SITE IS AT YOUR SOLE RISK. YOU (AND NOT
                LIFESTYLES DISCOVERY LLC) ASSUME THE ENTIRE COST OF ALL NECESSARY SERVICING, REPAIR
                OR CORRECTION OF YOUR SYSTEM. YOU EXPRESSLY AGREE THAT NEITHER LIFESTYLES DISCOVERY LLC,
                NOR ITS AFFILIATED OR RELATED ENTITIES (INCLUDING ITS PROVIDERS AND ITS WEB HOSTING
                SERVICE PROVIDERS, AND THEIR SUPPLIERS), NOR ANY OF THEIR RESPECTIVE EMPLOYEES, OR
                AGENTS, NOR ANY PERSON OR ENTITY INVOLVED IN THE CREATION, PRODUCTION, DISTRIBUTION,
                HOSTING, AND/OR OPERATION OF THIS WEB SITE, IS RESPONSIBLE OR LIABLE TO ANY PERSON
                OR ENTITY WHATSOEVER FOR ANY LOSS, DAMAGE (WHETHER ACTUAL, CONSEQUENTIAL, PUNITIVE
                OR OTHERWISE), INJURY, CLAIM, LIABILITY OR OTHER CAUSE OF ANY KIND OR CHARACTER
                WHATSOEVER BASED UPON OR RESULTING FROM THE USE OR ATTEMPTED USE OF THIS WEB SITE
                OR ANY OTHER LINKED SITE.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless LIFESTYLES DISCOVERY LLC, the Providers,
                and Web Site hosting service providers, and its and their officers, directors, employees,
                affiliates, agents, licensors, and suppliers from and against all losses, expenses,
                damages and costs, including reasonable attorneys' fees, resulting from any violation
                by you of these Terms.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Third Party Rights</h2>
              <p>
                These Terms are for the benefit of LIFESTYLES DISCOVERY LLC, its Providers, and Web Site
                hosting service providers, and its and their officers, directors, employees, affiliates,
                agents, licensors, and suppliers. Each of these individuals or entities shall have the
                right to assert and enforce these Terms directly against you on its/their own behalf.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Jurisdictional Issues</h2>
              <p>
                Unless otherwise specified, the Content contained in this Web Site is presented solely
                for your convenience and/or information. This Web Site is controlled and operated by
                LIFESTYLES DISCOVERY LLC from its offices in Houston, Texas. LIFESTYLES DISCOVERY LLC
                makes no representation that Content in its Web Site is appropriate or available for
                use in other locations. Those who choose to access this Web Site from other locations
                do so on their own initiative and are responsible for compliance with local laws, if
                and to the extent local laws are applicable.
              </p>
              <p>
                These Terms shall be governed by, construed and enforced in accordance with the laws
                of the State of Texas, as they are applied to agreements entered into and to be
                performed entirely within such State. Any action you, any third party or LIFESTYLES
                DISCOVERY LLC brings to enforce these Terms, or in connection with any matters related
                to this Web Site, shall be brought only in either the state or Federal courts located
                in and for Harris County, Texas and you expressly consent to the jurisdiction of said courts.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <p>
                If you have an on-line account with us, you are fully responsible for maintaining
                the confidentiality of your password and account username and for all activities
                that occur under your password and/or account username. You agree to: (i) keep your
                account username and password confidential and not share them with anyone else,
                and (ii) immediately notify us of any unauthorized use of your password and/or account
                username or other breach of security. Failure to notify us of any misuse or abuse
                of account or account password will be grounds for termination of all rights to
                use of this site.
              </p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Refund and Cancellation Policy</h2>
              <p>
                Use of Lifestyles Quest is based on a monthly subscription fee basis. There will
                be no refunds after the user purchases a subscription and logs onto the system and
                initiates either/and/or a comparable search, a rent comparable search or a community
                trend analysis. If a user decides to cancel, a 30 day notice is required. Neither
                the setup fee nor the first month's subscription fee is refundable under any circumstances.
              </p>
              <p>
                If a user never logs on, as evidenced by log-on tracking, a refund of a subsequent
                monthly subscription fee may be approved, if cancellation is requested in writing
                within 72 hours of initial sign up. If a user later purchases a monthly subscription
                after an earlier cancellation, a new setup fee is required. Setup fees are not transferable
                nor refundable.
              </p>
              <p className="font-semibold">Please note: Non-payment does not constitute cancellation.</p>
              <p>All cancellation notices must be made in writing and sent to:</p>
              <address className="not-italic">
                Lifestyles Discovery LLC<br />
                Re: Lifestyles Quest<br />
                11200 Westheimer #1000<br />
                Houston, TX 77042
              </address>
              <p>Or via fax: 713-782-0161</p>
              <p>Or via email: quest@luinc.com</p>

              <h2 className="mt-8 text-lg font-semibold text-gray-900 dark:text-white">Entire Agreement</h2>
              <p>
                The provisions and conditions of these Terms, and each obligation referenced herein,
                represent the entire Agreement between LIFESTYLES DISCOVERY LLC, its affiliated or
                related entities, and you, and supersede any prior agreements or understandings not
                incorporated herein. In the event that any inconsistencies exist between these Terms
                and any future published terms of use or understanding, the last published Terms or
                terms of use or understanding shall prevail.
              </p>

              <p className="mt-8 font-semibold">
                ANY RIGHTS NOT EXPRESSLY GRANTED HEREIN ARE RESERVED BY LIFESTYLES DISCOVERY LLC
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
