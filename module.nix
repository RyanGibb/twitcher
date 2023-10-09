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
          proxyPass = "http://127.0.0.1:${builtins.toString cfg.port}";
        };
      };
    };

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
        User = cfg.user;
        Group = cfg.group;
      };
    };

    # requires dns module
    eilean.services.dns.zones.${config.networking.domain}.records = [
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

    users.users = {
      "${cfg.user}" = {
        description = "Twitcher Service";
        useDefaultShell = true;
        group = cfg.group;
        isSystemUser = true;
      };
    };

    users.groups."${cfg.group}" = {};
  };
}
