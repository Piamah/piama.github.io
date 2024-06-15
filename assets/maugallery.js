(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  // Ecouteurs d'évent sur les filtres
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });
    //Ecoute click sur les nav-link dans gallery puis filterByTag
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // ------------ BUG N°1 ------------ //

    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

// FONCTION DE L'IMAGE PRECEDENTE
    prevImage() {
      // Récupération de l'url de l'image affichée
      let activeImage = $(".lightboxImage").attr("src");
      // Créé un ensemble de toutes les images visibles 
      let imagesCollection = [];
      // $ => queryselec // Récupération des images de la galerie et affichage dans imagesCollection
      $(".gallery-item:visible").each(function() {
        imagesCollection.push($(this).attr("src"));
      });
      // Trouve l'index de l'image active
      let currentIndex = imagesCollection.indexOf(activeImage);
      // Trouve l'index de l'image précédente
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      // Change la source de l'image affichée grâce à l'URL de l'image previous
      $(".lightboxImage").attr("src", imagesCollection[prevIndex]);
    },
// FONCTION DE L'IMAGE SUIVANTE
    nextImage() {
      // Récupération de l'URL de l'image affichée
      let activeImage = $(".lightboxImage").attr("src");
      let imagesCollection = [];
      // Créé un ensemble de toutes les images visibles
      $(".gallery-item:visible").each(function() {
        imagesCollection.push($(this).attr("src"));
      });
      // Trouve l'index de l'image active
      let currentIndex = imagesCollection.indexOf(activeImage);
      // Trouve l'index de l'image suivante
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      // Change la source de l'image affichée grâce à l'URL de l'image next
      $(".lightboxImage").attr("src", imagesCollection[nextIndex]);
    },

    // ------------ BUG N°2 ------------ //
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                              // Bouton previous
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                              // Bouton next
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },
    showItemTags(gallery, position, tags) {
      var tagItems =
      // réation du bouton tous actif par défaut
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      // Créé des bouton pour tous les filtres
        $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    // Processus de changement de la couleur du bouton
    filterByTag() {
      // Est-ce que le bouton sur lequel on clique est déjà actif ? Si oui, on fait rien
      if ($(this).hasClass("active-tag")) {
        return;
      }
      // Retire les styles de tous les autres boutons
      $(".tags-bar .nav-link").removeClass("active active-tag");
      // Ajoute le style au bouton actif
      $(this).addClass("active active-tag");
      // Récupération du taf (-> valeur) du bouton sur lequel on clique
      var tag = $(this).data("images-toggle");
    
      $(".gallery-item").each(function() {
        // Cache les images
        $(this).parents(".item-column").hide();
        // Si la valeur du bouton => tous
        if (tag === "all") {
          // Affiche tout
          $(this).parents(".item-column").show(300);
          // Si c'est pas tous => récupération de la valeur du bouton (tag)
        } else if ($(this).data("gallery-tag") === tag) {
          // Affiche le contenu correspondant
          $(this).parents(".item-column").show(300);
        }
      });
    }
  };
})(jQuery);


