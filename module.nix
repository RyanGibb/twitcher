{ pkgs, config, lib, options, ... }:

let cfg = config.services.twitcher; in
{
  options = {
    services.twitcher = {
      enable = lib.mkEnableOption "ryan's website";
      domain = lib.mkOption {
        type = lib.types.str;
        default = "twitcher.${config.networking.domain}";
      };
      port = lib.mkOption {
        type = lib.types.port;
        default = 8080;
      };
      user = lib.mkOption {
        type = lib.types.str;
        default = "twitcher";
      };
      group = lib.mkOption {
        type = lib.types.str;
        default = cfg.user;
      };
      dotenvFile = lib.mkOption {
        type = lib.types.path;
        default = null;
      };
      cname = lib.mkOption {
        type = lib.types.str;
        default = null;
        description = ''
          CNAME to create DNS records for.
          Ignored if null
        '';
      };
      containerHostAddress = lib.mkOption {
        type = lib.types.str;
        default = "192.168.100.10";
      };
    };
  };

  config = lib.mkIf cfg.enable {
    services.nginx = {
      enable = true;
      recommendedProxySettings = true;
      virtualHosts."${cfg.domain}" = {
        forceSSL = true;
        enableACME = true;
        locations."/" = {
          proxyPass = "http://${cfg.containerHostAddress}:${builtins.toString cfg.port}";
        };
      };
    };

    containers.twitcher = {
      autoStart = true;                
      privateNetwork = true;           
      hostAddress = cfg.containerHostAddress;

      config = {
        nixpkgs.pkgs = pkgs;
        systemd.services.twitcher = {
          enable = true;
          description = "twitcher";
          after = [ "network.target" ];
          wantedBy = [ "multi-user.target" ];
          environment.PORT = "${builtins.toString cfg.port}";
          serviceConfig = {
            ExecStart = "${pkgs.nodejs}/bin/node .";
            EnvironmentFile = cfg.dotenvFile;
            WorkingDirectory = "${pkgs.twitcher}/lib/node_modules/twitcher/";
            Restart = "always";
            RestartSec = "10s";
          };
        };
        system.stateVersion = "22.05";
      };
    };

    # requires dns module
    dns.records = [
      {
        name = "${cfg.domain}.";
        type = "CNAME";
        data = cfg.cname;
      }
      {
        name = "www.${cfg.domain}.";
        type = "CNAME";
        data = cfg.cname;
      }
    ];
  };
}
