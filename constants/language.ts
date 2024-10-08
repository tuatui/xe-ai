// 每种语言以`;`分割，每个别名以`,`分割，此语言的第一个别名为主要名字
const aliasOrigin =
  "1c;abnf;accesslog;actionscript,as;ada;angelscript,asc;apache,apacheconf;applescript,osascript;arcade;arduino,ino;armasm,arm;xml,html,xhtml,rss,atom,xjb,xsd,xsl,plist,wsf,svg;asciidoc,adoc;aspectj;autohotkey,ahk;autoit;avrasm;awk;axapta,x++;bash,sh,zsh;basic;bnf;brainfuck,bf;c,h;cal;capnproto,capnp;ceylon;clean,icl,dcl;clojure,clj,edn;clojure-repl;cmake,cmake.in;coffeescript,coffee,cson,iced;coq;cos,cls;cpp,cc,c++,h++,hpp,hh,hxx,cxx;crmsh,crm,pcmk;crystal,cr;csharp,cs,c#;csp;css;d;markdown,md,mkdown,mkd;dart;delphi,dpr,dfm,pas,pascal;diff,patch;django,jinja;dns,bind,zone;dockerfile,docker;dos,bat,cmd;dsconfig;dts;dust,dst;ebnf;elixir,ex,exs;elm;ruby,rb,gemspec,podspec,thor,irb;erb;erlang-repl;erlang,erl;excel,xlsx,xls;fix;flix;fortran,f90,f95;fsharp,fs,f#;gams,gms;gauss,gss;gcode,nc;gherkin,feature;glsl;gml;go,golang;golo;gradle;graphql,gql;groovy;haml;handlebars,hbs,html.hbs,html.handlebars,htmlbars;haskell,hs;haxe,hx;hsp;http,https;hy,hylang;inform7,i7;ini,toml;irpf90;isbl;java,jsp;javascript,js,jsx,mjs,cjs;jboss-cli,wildfly-cli;json,jsonc;julia;julia-repl,jldoctest;kotlin,kt,kts;lasso,lassoscript;latex,tex;ldif;leaf;less;lisp;livecodeserver;livescript,ls;llvm;lsl;lua;makefile,mk,mak,make;mathematica,mma,wl;matlab;maxima;mel;mercury,m,moo;mipsasm,mips;mizar;perl,pl,pm;mojolicious;monkey;moonscript,moon;n1ql;nestedtext,nt;nginx,nginxconf;nim;nix,nixos;node-repl;nsis;objectivec,mm,objc,obj-c,obj-c++,objective-c++;ocaml;openscad,scad;oxygene;parser3;pf,pf.conf;pgsql,postgres,postgresql;php;php-template;plaintext,text,txt;pony;powershell,pwsh,ps,ps1;processing,pde;profile;prolog;properties;protobuf,proto;puppet,pp;purebasic,pb,pbi;python,py,gyp,ipython;python-repl,pycon;q,k,kdb;qml,qt;r;reasonml,re;rib;roboconf,graph,instances;routeros,mikrotik;rsl;ruleslanguage;rust,rs;sas;scala;scheme,scm;scilab,sci;scss;shell,console,shellsession;smali;smalltalk,st;sml,ml;sqf;sql;stan,stanfuncs;stata,do,ado;step21,p21,step,stp;stylus,styl;subunit;swift;taggerscript;yaml,yml;tap;tcl,tk;thrift;tp;twig,craftcms;typescript,ts,tsx,mts,cts;vala;vbnet,vb;vbscript,vbs;vbscript-html;verilog,v,sv,svh;vhdl;vim;wasm;wren;x86asm;xl,tao;xquery,xpath,xq,xqm;zephir,zep";

const aliasAddition =
  "x86asm,assembly,asm;ruleslanguage,rules;taggerscript,tags;vbnet,vb.net;livecodeserver,livecode;objectivec,objective-c;jboss-cli,jboscli";

const formatter = (s: string, map: Map<string, string>) => {
  s.split(";").forEach((langSet) =>
    langSet.split(",").forEach((each, _, ls) => map.set(each, ls[0])),
  );
  return map;
};
export const langAliasMap = formatter(aliasOrigin, new Map());
export const langAliasAddition = formatter(aliasAddition, new Map());
for (const item of langAliasAddition) langAliasMap.set(...item);
