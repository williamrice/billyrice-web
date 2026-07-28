import React from 'react';
import Header from '@/components/Header';

const LicensingPage = () => {
  return (
    <div>
      <Header>
        <div className="h-full flex flex-col items-center justify-center">
          <h1 className="lg:text-6xl text-4xl font-bold text-center text-white">
            Licensing
          </h1>
        </div>
      </Header>

      {/* Content section with subtle gradient background */}
      <div>
        <div className="legal-content site-shell max-w-4xl py-20 sm:py-28">
          <div className="text-center mb-8">
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              This website is built with modern web technologies and its source
              code is available for others to learn from and build upon.
            </p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">
              Open Source Licensing Information
            </h2>
            <p className="mb-4 text-gray-300">
              The source code for this website (www.billyrice.com) is open
              source and is made available under the following license:
            </p>
            <div className="mb-6 border-l-2 border-primary bg-background/60 p-5 text-muted-foreground">
              <h3 className="font-bold mb-2">MIT License with Attribution</h3>
              <p className="mb-2">
                Copyright © {new Date().getFullYear()} William Rice
              </p>
              <p className="mb-2">
                Permission is hereby granted, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files (the &quot;Software&quot;), to deal in the Software
                without restriction, including without limitation the rights to
                use, copy, modify, merge, publish, distribute, sublicense,
                and/or sell copies of the Software, and to permit persons to
                whom the Software is furnished to do so, subject to the
                following conditions:
              </p>
              <p className="mb-2">
                <strong>
                  The above copyright notice, this permission notice, and
                  attribution to William Rice shall be included in all copies or
                  substantial portions of the Software.
                </strong>
              </p>
              <p>
                {' '}
                THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF
                ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
                AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
                HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
                WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
                FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
                OTHER DEALINGS IN THE SOFTWARE.
              </p>
            </div>
            <p className="mb-4">
              In simple terms, you are free to use, modify, and distribute this
              code, but you must:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Include the original copyright notice</li>
              <li>
                Include attribution to William Rice as the original author
              </li>
              <li>Include the license text in your derivative work</li>
            </ul>
            <p>
              If you have any questions or need further clarification regarding
              the licensing of this website, please contact me at
              contact@billyrice.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensingPage;
