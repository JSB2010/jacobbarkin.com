export type SignatureDefinition = {
  id: string;
  label: string;
  organization: string;
  html: string;
  rawPath: string;
  description?: string;
};

export const SITE_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXT_PUBLIC_SITE_URL || "https://jacobbarkin.com";

export const signatures: SignatureDefinition[] = [
  {
    id: "kent-denver",
    label: "Kent Denver School",
    organization: "Kent Denver School",
    rawPath: "/signatures/kent-denver/html",
    description: "Primary personal signature (Kent Denver School).",
    html: `<div data-spark-custom-html="true"><!-- Jacob Barkin – Signature (Kent Denver) -->
  <style>
    @media (prefers-color-scheme: dark) {
      .kd-card .kd-name { color: #f9fafb !important; }
      .kd-card .kd-org { color: #e5e7eb !important; }
      .kd-card .kd-link { color: #60a5fa !important; }
      .kd-card .kd-divider { background: #374151 !important; }
      .kd-card .kd-dot { color: #6b7280 !important; }
      .kd-card .kd-gradient-bar { background: linear-gradient(180deg, #60a5fa 0%, #34d399 100%) !important; }
    }
  </style>
  <table cellpadding="0" cellspacing="0" role="presentation" class="kd-card" style="border-collapse:collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <tbody>
      <tr>
        <td class="kd-gradient-bar" style="width:4px; background:linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius:8px 0 0 8px;"></td>
        <td style="padding:12px 14px;">
          <div class="kd-name" style="font-size:17px; line-height:1.3; font-weight:700; color:#111827;">Jacob Barkin</div>
          <div class="kd-org" style="font-size:13px; line-height:1.4; color:#6b7280; font-weight:500; padding-top:3px;">Kent Denver School</div>

          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>
          <div class="kd-divider" style="height:1px; background:linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);"></div>
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>

          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="font-size:13px; line-height:1.5; white-space:nowrap; vertical-align:middle;">
                  <a href="tel:+13033356920" class="kd-link" style="color:#374151; text-decoration:none; font-weight:500; transition:color 0.2s;">(303) 335-6920</a>
                </td>
                <td class="kd-dot" style="padding:0 10px; font-size:13px; color:#d1d5db; vertical-align:middle;">•</td>
                <td style="font-size:13px; line-height:1.5; white-space:nowrap; vertical-align:middle;">
                  <img src="https://jacobbarkin.com/images/Updated%20logo.png" width="18" height="18" alt="JB" style="vertical-align:middle; display:inline-block; border:0; outline:none; margin-right:6px; border-radius:3px;">
                  <a href="https://jacobbarkin.com" class="kd-link" style="color:#374151; text-decoration:none; font-weight:500; transition:color 0.2s;">jacobbarkin.com</a>
                </td>
              </tr>
                  <td style="padding-right:8px; vertical-align:middle;">
                    <a href="https://github.com/jsb2010" aria-label="GitHub: jsb2010" style="display:inline-block; background:#111827; border-radius:7px; padding:7px; text-decoration:none; line-height:0; transition:transform 0.2s, box-shadow 0.2s;">
                      <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" width="17" height="17" alt="GitHub" style="display:block; border:0; outline:none;">
          <div style="height:6px; line-height:6px; font-size:6px;">&nbsp;</div>

          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="padding-right:8px; vertical-align:middle;">
                  <a href="https://github.com/jsb2010" aria-label="GitHub: jsb2010" style="display:inline-block; background:#111827; border-radius:7px; padding:7px; text-decoration:none; line-height:0; transition:transform 0.2s, box-shadow 0.2s;">
                    <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" width="17" height="17" alt="GitHub" style="display:block; border:0; outline:none;">
                  </a>
                </td>
                <td style="vertical-align:middle;">
                  <a href="https://www.linkedin.com/in/jacobbarkin" aria-label="LinkedIn: jacobbarkin" style="display:inline-block; background:#0077b5; border-radius:7px; padding:7px; text-decoration:none; line-height:0; transition:transform 0.2s, box-shadow 0.2s;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="17" height="17" alt="LinkedIn" style="display:block; border:0; outline:none;">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>`
  },
  {
    id: "ask-the-kidz",
    label: "Ask The Kidz",
    organization: "Ask The Kidz",
    rawPath: "/signatures/ask-the-kidz/html",
    description: "Ask The Kidz signature with both site links.",
    html: `<div data-spark-custom-html="true"><!-- Jacob Barkin – Signature (Ask The Kidz) -->
  <style>
    @media (prefers-color-scheme: dark) {
      .atk-card .atk-name { color: #f9fafb !important; }
      .atk-card .atk-org { color: #e5e7eb !important; }
      .atk-card .atk-link { color: #60a5fa !important; }
      .atk-card .atk-divider { background: #374151 !important; }
      .atk-card .atk-dot { color: #6b7280 !important; }
      .atk-card .atk-gradient-bar { background: linear-gradient(180deg, #60a5fa 0%, #34d399 100%) !important; }
    }
  </style>
  <table cellpadding="0" cellspacing="0" role="presentation" class="atk-card" style="border-collapse:collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <tbody>
      <tr>
        <td class="atk-gradient-bar" style="width:4px; background:linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius:8px 0 0 8px;"></td>
        <td style="padding:12px 14px;">
          <div class="atk-name" style="font-size:17px; line-height:1.3; font-weight:700; color:#111827;">Jacob Barkin</div>
          <div class="atk-org" style="font-size:13px; line-height:1.4; color:#6b7280; font-weight:500; padding-top:3px;">CEO/Founder · Ask The Kidz</div>

          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>
          <div class="atk-divider" style="height:1px; background:linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);"></div>
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>

          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="font-size:13px; line-height:1.5; white-space:nowrap; vertical-align:middle;">
                  <a href="tel:+13033356920" class="atk-link" style="color:#374151; text-decoration:none; font-weight:500; transition:color 0.2s;">(303) 335-6920</a>
                </td>
                <td class="atk-dot" style="padding:0 10px; font-size:13px; color:#d1d5db; vertical-align:middle;">•</td>
                <td style="font-size:13px; line-height:1.5; white-space:nowrap; vertical-align:middle;">
                  <img src="https://jacobbarkin.com/images/Updated%20logo.png" width="18" height="18" alt="JB" style="vertical-align:middle; display:inline-block; border:0; outline:none; margin-right:6px; border-radius:3px;">
                  <a href="https://jacobbarkin.com" class="atk-link" style="color:#374151; text-decoration:none; font-weight:500; transition:color 0.2s;">jacobbarkin.com</a>
                </td>
                <td class="atk-dot" style="padding:0 10px; font-size:13px; color:#d1d5db; vertical-align:middle;">•</td>
                <td style="font-size:13px; line-height:1.5; white-space:nowrap; vertical-align:middle;">
                  <img src="${SITE_BASE_URL}/icons/askthekidz-logo.jpeg" width="18" height="18" alt="Ask The Kidz" style="vertical-align:middle; display:inline-block; border:0; outline:none; margin-right:6px; border-radius:3px;">
                  <a href="https://askthekidz.com" class="atk-link" style="color:#374151; text-decoration:none; font-weight:500; transition:color 0.2s;">askthekidz.com</a>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="height:6px; line-height:6px; font-size:6px;">&nbsp;</div>

          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="padding-right:8px; vertical-align:middle;">
                  <a href="https://github.com/jsb2010" aria-label="GitHub: jsb2010" style="display:inline-block; background:#111827; border-radius:7px; padding:7px; text-decoration:none; line-height:0; transition:transform 0.2s, box-shadow 0.2s;">
                    <img src="https://user-images.githubusercontent.com/3369400/139447912-e0f43f33-6d9f-45f8-be46-2df5bbc91289.png" width="17" height="17" alt="GitHub" style="display:block; border:0; outline:none;">
                  </a>
                </td>
                <td style="vertical-align:middle;">
                  <a href="https://www.linkedin.com/in/jacobbarkin" aria-label="LinkedIn: jacobbarkin" style="display:inline-block; background:#0077b5; border-radius:7px; padding:7px; text-decoration:none; line-height:0; transition:transform 0.2s, box-shadow 0.2s;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="17" height="17" alt="LinkedIn" style="display:block; border:0; outline:none;">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>`
  },
  {
    id: "professional",
    label: "Professional (Outlook-optimized)",
    organization: "Universal",
    rawPath: "/signatures/professional/html",
    description: "Polished professional signature with full contact info and excellent email client compatibility.",
    html: `<div data-spark-custom-html="true"><!-- Jacob Barkin – Professional Signature -->
  <style>
    /* Dark mode overrides for clients that support prefers-color-scheme (Apple Mail, iOS Mail, some webmail) */
    @media (prefers-color-scheme: dark) {
      .jb-card { background: transparent !important; }
      .jb-card .jb-name { color: #f9fafb !important; }
      .jb-card .jb-muted { color: #e5e7eb !important; }
      .jb-card .jb-subtle { color: #d1d5db !important; }
      .jb-card .jb-divider { background: #374151 !important; }
      .jb-card a { color: #60a5fa !important; }
      .jb-card svg path { stroke: #d1d5db !important; }
      .jb-card .jb-gradient-bar { background: linear-gradient(180deg, #60a5fa 0%, #34d399 100%) !important; }
      .jb-card .jb-icon { filter: invert(1) brightness(1.25) !important; }
      .jb-card .jb-social-github { background: #111827 !important; }
      .jb-card .jb-social-linkedin { background: rgb(50, 114, 174) !important; }
      .jb-card .jb-social-img { filter: none !important; }
    }
  </style>
  <!--[if mso]>
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="padding:0;">
  <![endif]-->
  <table cellpadding="0" cellspacing="0" role="presentation" class="jb-card" style="border-collapse:collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width:480px; background:transparent; border:0; border-radius:8px;">
    <tbody>
      <tr>
        <td class="jb-gradient-bar" style="width:4px; background:linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius:6px 0 0 6px; mso-line-height-rule:exactly;">
          <!--[if mso]><div style="width:4px; background:#3b82f6;">&nbsp;</div><![endif]-->
        </td>
        <td style="padding:12px 16px;">
          <!-- Name and Title -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr>
                <td style="padding-right:12px; vertical-align:top;">
                  <img src="https://jacobbarkin.com/images/Updated%20logo.png" width="48" height="48" alt="Jacob Barkin" style="display:block; border:0; outline:none; border-radius:6px;">
                </td>
                <td style="vertical-align:top;">
                  <div class="jb-name" style="font-size:18px; line-height:1.3; font-weight:700; color:#3b82f6; margin:0; padding:0;">
                    Jacob Barkin
                  </div>
                  <div class="jb-muted" style="font-size:13px; line-height:1.4; color:#6b7280; font-weight:500; margin:0; padding:3px 0 0 0;">Student · Kent Denver School</div>
                  <div class="jb-subtle" style="font-size:12px; line-height:1.4; color:#9ca3af; font-weight:400; margin:0; padding:2px 0 0 0;">Denver, CO</div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Divider -->
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>
          <div class="jb-divider" style="height:1px; background:#e5e7eb; margin:0; mso-line-height-rule:exactly;"></div>
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>

          <!-- Contact Info -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr>
                <td class="jb-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0 0 3px 0;">
                  <img class="jb-icon" src="${SITE_BASE_URL}/icons/mail.png" width="14" height="14" alt="Email" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none;">
                  <a href="mailto:{{EMAIL}}" style="color:#374151; text-decoration:none; font-weight:500;">{{EMAIL}}</a>
                </td>
              </tr>
              <tr>
                <td class="jb-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0 0 3px 0;">
                  <img class="jb-icon" src="${SITE_BASE_URL}/icons/phone.png" width="14" height="14" alt="Phone" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none;">
                  <a href="tel:+13033356920" style="color:#374151; text-decoration:none; font-weight:500;">(303) 335-6920</a>
                </td>
              </tr>
              <tr>
                <td class="jb-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0;">
                  <img class="jb-icon" src="${SITE_BASE_URL}/icons/globe.png" width="14" height="14" alt="Website" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none;">
                  <a href="https://jacobbarkin.com" style="color:#3b82f6; text-decoration:none; font-weight:500;">jacobbarkin.com</a>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Social Links -->
          <div style="height:10px; line-height:10px; font-size:10px;">&nbsp;</div>
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="padding-right:8px; vertical-align:middle;">
                          <a href="https://github.com/jsb2010" aria-label="GitHub: jsb2010" title="GitHub" class="jb-social-github" style="display:inline-block; background:#111827; border-radius:6px; padding:6px; text-decoration:none; line-height:0;">
                            <img class="jb-social-img" src="https://user-images.githubusercontent.com/3369400/139447912-e0f43f33-6d9f-45f8-be46-2df5bbc91289.png" width="16" height="16" alt="GitHub" style="display:block; border:0; outline:none;">
                  </a>
                </td>
                <td style="vertical-align:middle;">
                  <a href="https://www.linkedin.com/in/jacobbarkin" aria-label="LinkedIn: jacobbarkin" title="LinkedIn" class="jb-social-linkedin" style="display:inline-block; background:rgb(50, 114, 174); border-radius:6px; padding:6px; text-decoration:none; line-height:0;">
                    <img class="jb-social-img" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="16" height="16" alt="LinkedIn" style="display:block; border:0; outline:none;">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

        </td>
      </tr>
    </tbody>
  </table>
  <!--[if mso]>
  </td></tr></table>
  <![endif]-->
</div>`
  },
  {
    id: "professional-atk",
    label: "Professional Ask The Kidz (Outlook-optimized)",
    organization: "Ask The Kidz",
    rawPath: "/signatures/professional-atk/html",
    description: "Polished professional Ask The Kidz signature with full contact info and both website links.",
    html: `<div data-spark-custom-html="true"><!-- Jacob Barkin – Professional Ask The Kidz Signature -->
  <style>
    /* Dark mode overrides for clients that support prefers-color-scheme (Apple Mail, iOS Mail, some webmail) */
    @media (prefers-color-scheme: dark) {
      .jb-atk-card { background: transparent !important; }
      .jb-atk-card .jb-atk-name { color: #f9fafb !important; }
      .jb-atk-card .jb-atk-muted { color: #e5e7eb !important; }
      .jb-atk-card .jb-atk-subtle { color: #d1d5db !important; }
      .jb-atk-card .jb-atk-divider { background: #374151 !important; }
      .jb-atk-card a { color: #60a5fa !important; }
      .jb-atk-card svg path { stroke: #d1d5db !important; }
      .jb-atk-card .jb-atk-gradient-bar { background: linear-gradient(180deg, #60a5fa 0%, #34d399 100%) !important; }
      .jb-atk-card .jb-icon { filter: invert(1) brightness(1.25) !important; }
      .jb-atk-card .jb-social-github { background: #111827 !important; }
      .jb-atk-card .jb-social-linkedin { background: rgb(50, 114, 174) !important; }
      .jb-atk-card .jb-social-img { filter: none !important; }
    }
  </style>
  <!--[if mso]>
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="padding:0;">
  <![endif]-->
  <table cellpadding="0" cellspacing="0" role="presentation" class="jb-atk-card" style="border-collapse:collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width:480px; background:transparent; border:0; border-radius:8px;">
    <tbody>
      <tr>
        <td class="jb-atk-gradient-bar" style="width:4px; background:linear-gradient(180deg, #3b82f6 0%, #10b981 100%); border-radius:6px 0 0 6px; mso-line-height-rule:exactly;">
          <!--[if mso]><div style="width:4px; background:#3b82f6;">&nbsp;</div><![endif]-->
        </td>
        <td style="padding:12px 16px;">
          <!-- Name and Title -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr>
                <td style="padding-right:12px; vertical-align:top;">
                  <img src="https://jacobbarkin.com/images/Updated%20logo.png" width="48" height="48" alt="Jacob Barkin" style="display:block; border:0; outline:none; border-radius:6px;">
                </td>
                <td style="vertical-align:top;">
                  <div class="jb-atk-name" style="font-size:18px; line-height:1.3; font-weight:700; color:#3b82f6; margin:0; padding:0;">
                    Jacob Barkin
                  </div>
                  <div class="jb-atk-muted" style="font-size:13px; line-height:1.4; color:#6b7280; font-weight:500; margin:0; padding:3px 0 0 0;">CEO/Founder · Ask The Kidz</div>
                  <div class="jb-atk-subtle" style="font-size:12px; line-height:1.4; color:#9ca3af; font-weight:400; margin:0; padding:2px 0 0 0;">Denver, CO</div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Divider -->
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>
          <div class="jb-atk-divider" style="height:1px; background:#e5e7eb; margin:0; mso-line-height-rule:exactly;"></div>
          <div style="height:8px; line-height:8px; font-size:8px;">&nbsp;</div>

          <!-- Contact Info -->
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr>
                <td class="jb-atk-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0 0 3px 0;">
                  <img class="jb-icon" src="${SITE_BASE_URL}/icons/mail.png" width="14" height="14" alt="Email" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none;">
                  <a href="mailto:{{EMAIL}}" style="color:#374151; text-decoration:none; font-weight:500;">{{EMAIL}}</a>
                </td>
              </tr>
              <tr>
                <td class="jb-atk-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0 0 3px 0;">
                  <img class="jb-icon" src="${SITE_BASE_URL}/icons/phone.png" width="14" height="14" alt="Phone" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none;">
                  <a href="tel:+13033356920" style="color:#374151; text-decoration:none; font-weight:500;">(303) 335-6920</a>
                </td>
              </tr>
              <tr>
                <td class="jb-atk-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0 0 3px 0;">
                  <img src="${SITE_BASE_URL}/images/Updated%20logo.png" width="14" height="14" alt="jacobbarkin.com" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none; border-radius:3px;">
                  <a href="https://jacobbarkin.com" style="color:#3b82f6; text-decoration:none; font-weight:500;">jacobbarkin.com</a>
                </td>
              </tr>
              <tr>
                <td class="jb-atk-muted" style="font-size:13px; line-height:1.8; color:#6b7280; padding:0;">
                  <img src="${SITE_BASE_URL}/icons/askthekidz-logo.jpeg" width="14" height="14" alt="askthekidz.com" style="vertical-align:middle; margin-right:7px; display:inline-block; border:0; outline:none; border-radius:3px;">
                  <a href="https://askthekidz.com" style="color:#3b82f6; text-decoration:none; font-weight:500;">askthekidz.com</a>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Social Links -->
          <div style="height:10px; line-height:10px; font-size:10px;">&nbsp;</div>
          <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
            <tbody>
              <tr valign="middle">
                <td style="padding-right:8px; vertical-align:middle;">
                  <a href="https://github.com/jsb2010" aria-label="GitHub: jsb2010" title="GitHub" class="jb-social-github" style="display:inline-block; background:#111827; border-radius:6px; padding:6px; text-decoration:none; line-height:0;">
                    <img class="jb-social-img" src="https://user-images.githubusercontent.com/3369400/139447912-e0f43f33-6d9f-45f8-be46-2df5bbc91289.png" width="16" height="16" alt="GitHub" style="display:block; border:0; outline:none;">
                  </a>
                </td>
                <td style="vertical-align:middle;">
                  <a href="https://www.linkedin.com/in/jacobbarkin" aria-label="LinkedIn: jacobbarkin" title="LinkedIn" class="jb-social-linkedin" style="display:inline-block; background:rgb(50, 114, 174); border-radius:6px; padding:6px; text-decoration:none; line-height:0;">
                    <img class="jb-social-img" src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" width="16" height="16" alt="LinkedIn" style="display:block; border:0; outline:none;">
                  </a>
                </td>
              </tr>
            </tbody>
          </table>

        </td>
      </tr>
    </tbody>
  </table>
  <!--[if mso]>
  </td></tr></table>
  <![endif]-->
</div>`
  }
];

export function getSignatureById(id: string) {
  return signatures.find((sig) => sig.id === id);
}
