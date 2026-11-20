# Privacy Policy for DocCleaner - Better Studocu & Scribd Reader (Free)

**Effective Date:** November 20, 2026  
**Applicable Versions:** v1.8.0+

## 1. Zero Data Collection & Local Execution
**DocCleaner** is committed to absolute privacy. The extension does **NOT** collect, track, transmit, or monetize any personal data, browsing history, or document content. All parsing, ad removal, and layout adjustments run 100% locally within your own browser engine.

- **Zero Cloud Tracking:** No analytics SDKs, telemetry beacons, or external server calls.
- **Zero Third-Party Sharing:** Your data is never sold, transferred, or shared.
- **Local Study Shelf:** The extension provides a local "Study Shelf" remembering recently viewed/cleaned documents (up to 25 items). This information is saved exclusively in your browser's local storage (`chrome.storage.local`) and is never sent across any network.
- **Lab PC Mode & Clean & Burn:** When studying on public or shared computers, students can enable "Lab PC Mode", which stores data strictly in ephemeral session memory (`chrome.storage.session`) and auto-purges upon closing the window. The "Clean & Burn" button allows instantaneous wiping of all local history and cookies with a single click.

## 2. Permissions Justification
DocCleaner requests only the minimal set of browser permissions strictly necessary to deliver its core functionality:
- **`storage`**: Used exclusively on your device to persist your chosen interface language (English, Vietnamese, Spanish, French), Lab PC Mode preferences, and your local Study Shelf list.
- **`cookies`**: Used exclusively to clear cached promotional banners, paywall states, and session data on supported domains (`studocu.com`, `studocu.vn`, `scribd.com`) to provide a clean reading experience and allow complete data erasure via "Clean & Burn".
- **`scripting` & `activeTab`**: Used strictly on demand to apply distraction-free reading stylesheets and execute the A4 print normalization engine when you request it.
- **`webNavigation`**: Used to detect navigation events on supported study platforms so that reading mode styles can be applied early (`document_start`) before intrusive banners render.
- **Host Permissions (`studocu.com`, `studocu.vn`, `scribd.com`)**: Required to interact with document pages on these specific platforms to eliminate clutter and format study notes.

## 3. Voluntary Feedback Page
When the extension is uninstalled, a voluntary feedback survey page (`uninstall.html`) may open. Submitting feedback is entirely optional and contains zero personally identifying information.

## 4. Open Source Transparency & Contact
DocCleaner is open source. You can audit the complete source code directly on GitHub:  
- **Source Code:** [https://github.com/khanhnkq/DocCleaner](https://github.com/khanhnkq/DocCleaner)  
- **Support the Developer:** [https://khanhnkq.quizken.com/buy-me-a-coffee](https://khanhnkq.quizken.com/buy-me-a-coffee)
