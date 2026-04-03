\ProvidesClass{resume}[2015/05/25 v0.1 Resume class]

\LoadClass[11pt]{article}

% disable indent globally
\setlength{\parindent}{0pt}

% some general improvements, defines the XeTeX logo
\RequirePackage{xltxtra}

% use xifthen
\RequirePackage{xifthen}

% use fontawesome5 instead of legacy fontawesome
\RequirePackage{fontawesome5}

% use xcolor for customizing color
\RequirePackage[usenames,dvipsnames]{xcolor}

% loading fonts
\RequirePackage{fontspec}

% -----------------------------------------------------------------------------
% IMPORTANT FIX for Tectonic / Cloud environments:
% We DO NOT call \setmainfont or \setsansfont here!
% Calling them without a perfectly installed local OS font (like Latin Modern)
% can cause certain ligatures or special bullet points to fallback to nullfont.
% Instead, we let `xeCJK` and the standard LaTeX engine use the default
% Computer Modern fonts for English, which are universally guaranteed to work.
% -----------------------------------------------------------------------------

\RequirePackage[
        a4paper,
        left=0.8in,
        right=0.8in,
        top=0.70in,
        bottom=0.55in,
        nohead
]{geometry}

\RequirePackage{titlesec}
\RequirePackage{enumitem}
\setlist{noitemsep} % removes spacing from items but leaves space around the whole list
%\setlist{nosep} % removes all vertical spacing within and around the list
\setlist[itemize]{topsep=0.25em, leftmargin=1.5pc}
\setlist[enumerate]{topsep=0.25em, leftmargin=1.5pc}
\RequirePackage[super]{nth}

\titleformat{\section}         % Customise the \section command 
  {\Large\scshape\raggedright} % Make the \section headers large (\Large),
                               % small capitals (\scshape) and left aligned (\raggedright)
  {}{0em}                      % Can be used to give a prefix to all sections, like 'Section ...'
  {}                           % Can be used to insert code before the heading
  [{\titlerule}]                 % Inserts a horizontal line after the heading
\titlespacing*{\section}{0cm}{*1.8}{*1.8}

\titleformat{\subsection}
  {\large\raggedright}
  {}{0em}
  {}
\titlespacing*{\subsection}{0cm}{*1.8}{*0.6}

\newcommand{\datedsection}[2]{%
  \section[#1]{#1 \hfill #2}%
}
\newcommand{\datedsubsection}[2]{%
  \subsection[#1]{#1 \hfill #2}%
}
\newcommand{\datedline}[2]{%
  {\par #1 \hfill #2 \par}%
}

\newcommand{\name}[1]{
  \centerline{\Huge\scshape{#1}}
  \vspace{1.2ex}
}

\newcommand{\contactInfo}[4]{
  \centerline{\sffamily\large{\ {#1} \textperiodcentered\ \ {#2}}
    \ifthenelse{\isempty{#3}}%
      { } % if {#3} is empty
      {\textperiodcentered\ \ {#3} } % makes sure no space is added
    \ifthenelse{\isempty{#4}}%
      { } % if {#4} is empty
      {\textperiodcentered\ \ {#4} } % makes sure no space is added
  }
  \vspace{0.7ex}
}

\newcommand{\role}[2]{
  {\par \textit{#1} ~ #2 \par}
  \vspace{0.5ex}
}

% -----------------------------------------------------------------------------
% New commands for basic info
% -----------------------------------------------------------------------------
\newcommand{\email}[1]{\faEnvelope\ \href{mailto:#1}{#1}}
\newcommand{\phone}[1]{\faPhone\ {#1}}
\newcommand{\linkedin}[2][]{\faLinkedin\ 
  \ifthenelse{\isempty{#1}}%
    {\href{#2}{#2}}
    {\href{#2}{#1}}}
\newcommand{\github}[2][]{\faGithub\ 
  \ifthenelse{\isempty{#1}}%
    {\href{#2}{#2}}
    {\href{#2}{#1}}}
\newcommand{\homepage}[2][]{\faLink\ 
  \ifthenelse{\isempty{#1}}%
    {\href{#2}{#2}}
    {\href{#2}{#1}}}
\newcommand{\basicInfo}[1]{
  \centerline{\sffamily\large{#1}}
  \vspace{1.5ex}
}