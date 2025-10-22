import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import toast from "react-hot-toast";

interface DomainSelector {
  id: string;
  domain: string;
  titleSelector?: string;
  descriptionSelector?: string;
  ingredientsSelector?: string;
  instructionsSelector?: string;
  prepTimeSelector?: string;
  cookTimeSelector?: string;
  servingsSelector?: string;
  imageSelector?: string;
  cuisineSelector?: string;
}

interface DomainSelectorManagerProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
}

export function DomainSelectorManager({
  isOpen,
  onClose,
  domain,
}: DomainSelectorManagerProps) {
  const [selectors, setSelectors] = React.useState<Partial<DomainSelector>>({
    domain: domain || "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [existingSelectors, setExistingSelectors] = React.useState<
    DomainSelector[]
  >([]);

  React.useEffect(() => {
    if (isOpen) {
      fetchExistingSelectors();
      if (domain) {
        fetchDomainSelector(domain);
      }
    }
  }, [isOpen, domain]);

  const fetchExistingSelectors = async () => {
    try {
      const response = await fetch("/api/domain-selectors");
      const result = await response.json();
      if (result.success) {
        setExistingSelectors(result.domainSelectors);
      }
    } catch (error) {
      console.error("Error fetching domain selectors:", error);
    }
  };

  const fetchDomainSelector = async (domainName: string) => {
    try {
      const response = await fetch(
        `/api/domain-selectors?domain=${encodeURIComponent(domainName)}`
      );
      const result = await response.json();
      if (result.success && result.domainSelector) {
        setSelectors(result.domainSelector);
      } else {
        setSelectors({ domain: domainName });
      }
    } catch (error) {
      console.error("Error fetching domain selector:", error);
    }
  };

  const handleSave = async () => {
    if (!selectors.domain?.trim()) {
      toast.error("Domain is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/domain-selectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectors),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Domain selectors saved successfully!");
        fetchExistingSelectors();
      } else {
        toast.error(result.error || "Failed to save domain selectors");
      }
    } catch (error) {
      console.error("Error saving domain selectors:", error);
      toast.error("Failed to save domain selectors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (domainName: string) => {
    if (
      !confirm(`Are you sure you want to delete selectors for ${domainName}?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/domain-selectors?domain=${encodeURIComponent(domainName)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Domain selectors deleted successfully!");
        fetchExistingSelectors();
        if (selectors.domain === domainName) {
          setSelectors({ domain: "" });
        }
      } else {
        toast.error(result.error || "Failed to delete domain selectors");
      }
    } catch (error) {
      console.error("Error deleting domain selectors:", error);
      toast.error("Failed to delete domain selectors");
    }
  };

  const handleInputChange = (field: keyof DomainSelector, value: string) => {
    setSelectors((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Domain Selector Manager</h2>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Configure custom CSS selectors for specific domains to improve
            scraping accuracy.
          </p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Add/Edit Domain Selectors
              </h3>

              <div>
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={selectors.domain || ""}
                  onChange={(e) => handleInputChange("domain", e.target.value)}
                  placeholder="example.com"
                />
              </div>

              <div>
                <Label htmlFor="titleSelector">Title Selector</Label>
                <Input
                  id="titleSelector"
                  value={selectors.titleSelector || ""}
                  onChange={(e) =>
                    handleInputChange("titleSelector", e.target.value)
                  }
                  placeholder="h1.recipe-title, .entry-title"
                />
              </div>

              <div>
                <Label htmlFor="descriptionSelector">
                  Description Selector
                </Label>
                <Input
                  id="descriptionSelector"
                  value={selectors.descriptionSelector || ""}
                  onChange={(e) =>
                    handleInputChange("descriptionSelector", e.target.value)
                  }
                  placeholder=".recipe-description, .summary"
                />
              </div>

              <div>
                <Label htmlFor="ingredientsSelector">
                  Ingredients Selector
                </Label>
                <Input
                  id="ingredientsSelector"
                  value={selectors.ingredientsSelector || ""}
                  onChange={(e) =>
                    handleInputChange("ingredientsSelector", e.target.value)
                  }
                  placeholder=".ingredients li, .recipe-ingredient"
                />
              </div>

              <div>
                <Label htmlFor="instructionsSelector">
                  Instructions Selector
                </Label>
                <Input
                  id="instructionsSelector"
                  value={selectors.instructionsSelector || ""}
                  onChange={(e) =>
                    handleInputChange("instructionsSelector", e.target.value)
                  }
                  placeholder=".instructions li, .recipe-instruction"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prepTimeSelector">Prep Time Selector</Label>
                  <Input
                    id="prepTimeSelector"
                    value={selectors.prepTimeSelector || ""}
                    onChange={(e) =>
                      handleInputChange("prepTimeSelector", e.target.value)
                    }
                    placeholder=".prep-time"
                  />
                </div>

                <div>
                  <Label htmlFor="cookTimeSelector">Cook Time Selector</Label>
                  <Input
                    id="cookTimeSelector"
                    value={selectors.cookTimeSelector || ""}
                    onChange={(e) =>
                      handleInputChange("cookTimeSelector", e.target.value)
                    }
                    placeholder=".cook-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servingsSelector">Servings Selector</Label>
                  <Input
                    id="servingsSelector"
                    value={selectors.servingsSelector || ""}
                    onChange={(e) =>
                      handleInputChange("servingsSelector", e.target.value)
                    }
                    placeholder=".servings, .yield"
                  />
                </div>

                <div>
                  <Label htmlFor="cuisineSelector">Cuisine Selector</Label>
                  <Input
                    id="cuisineSelector"
                    value={selectors.cuisineSelector || ""}
                    onChange={(e) =>
                      handleInputChange("cuisineSelector", e.target.value)
                    }
                    placeholder=".cuisine"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageSelector">Image Selector</Label>
                <Input
                  id="imageSelector"
                  value={selectors.imageSelector || ""}
                  onChange={(e) =>
                    handleInputChange("imageSelector", e.target.value)
                  }
                  placeholder=".recipe-image img, .featured-image img"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gradient-dark to-gradient-light"
              >
                {isLoading ? "Saving..." : "Save Selectors"}
              </Button>
            </div>

            {/* Existing Selectors List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Existing Domain Selectors
              </h3>

              {existingSelectors.length === 0 ? (
                <p className="text-gray-500">No domain selectors saved yet.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {existingSelectors.map((selector) => (
                    <div
                      key={selector.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{selector.domain}</h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {selector.titleSelector && (
                              <div>Title: {selector.titleSelector}</div>
                            )}
                            {selector.ingredientsSelector && (
                              <div>
                                Ingredients: {selector.ingredientsSelector}
                              </div>
                            )}
                            {selector.instructionsSelector && (
                              <div>
                                Instructions: {selector.instructionsSelector}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectors(selector)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(selector.domain)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
